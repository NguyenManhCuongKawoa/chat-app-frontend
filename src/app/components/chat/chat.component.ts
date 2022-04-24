
import { Component, HostListener, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as SockJS from 'sockjs-client';
import { Stomp, Client } from '@stomp/stompjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import * as uuid from 'uuid';

import {ImagePreview, Message, User} from '../../interfaces/common'
import {
  getAllUsersWithoutMe,
  countNewMessages, 
  getUserById,
  findChatMessages,
  findChatMessage,
} from '../../utils/ApiUtil'
import { ScrollToBottomDirective } from 'src/app/utils/scroll-to-bottom.directive';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit {
  
  // @ViewChild(ScrollToBottomDirective)
  scroll: ScrollToBottomDirective;

  @ViewChild('textMessageRef', {static: false}) 
  private textMessageRef: ElementRef;
  
  title = 'WebSocketChatRoom';

  private stompClient = null;
  private uId: number;
  private user: User;
  private userActive: User;
  private contactUsers: User[] = [];
  private messages: Message[] = [];
  private text: string;

  private imagePreviews: ImagePreview[] = [];


  constructor(private route: ActivatedRoute, private router: Router){}

  ngOnInit() {
    
    const _this = this;

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.uId = +params.get('id')
      getUserById(this.uId)
        .then(json => {
          _this.user = json
        })
        .catch(err => console.log(err.message))
    
    })
   
    this.connect();
    this.loadContacts();
  }

  ngAfterViewInit() {
    this.textMessageRef.nativeElement.focus();
  }

  connect() {
    const _this = this;
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(() => socket);
    console.log(this.stompClient); 

    this.stompClient.connect({}, _this.onConnected.bind(_this), _this.onError.bind(_this), _this.onClosed.bind(_this))
  }

  onConnected(frame) {
    console.log('Connected: ' + frame);

    this.stompClient.subscribe(
      "/user/status", 
      this.onChangeStatus.bind(this)
    );
    
    this.stompClient.subscribe(
      "/user/" + this.uId + "/messages", 
      this.onMessageReceived.bind(this)
    );

   
    this.sendStatusUser(1)
  }

  onError(err) {
    console.log("Error", err);
    
    this.onDisconnect()
  };

  onClosed(event) {
    console.log("Closed", event);
  };

  onMessageReceived(msg) {
    const _this = this;
    const notification = JSON.parse(msg.body);
    if (this.userActive.id == notification.senderId) {
      findChatMessage(notification.id).then((message) => {
        _this.messages.push(message);
      });
    } else {
      // Notification message arrived
      _this.loadContacts()
    }
  }

  onChangeStatus(payload) {
    
    console.log('change online:', payload);
    const _this = this;
    const user = JSON.parse(payload.body);
    _this.contactUsers.map((contact) => {
      if(contact.id === user.id) {
        contact.online = user.online;
      }
      return contact;
    })
  }

  sendMessage(msg) {
    const _this = this
    if (msg.trim() !== "") {
      const message:Message = {
        senderId: _this.user.id,
        recipientId: _this.userActive.id,
        senderName: _this.user.username,
        recipientName: _this.userActive.username,
        content: msg,
        timestamp: new Date(),
      };
      _this.stompClient.send("/app/chat", {}, JSON.stringify(message));

      _this.messages.push(message);
      _this.contactUsers = _this.contactUsers.filter(a => a.id != _this.userActive.id)
      _this.contactUsers.unshift(_this.userActive)
    }
  };

  handleSendMessage() {
    this.sendMessage(this.text);
    this.text = ''
  }

  enterForSubmit(event: KeyboardEvent) {
    if(event.keyCode === 13) {
      this.handleSendMessage()
    }
    return true
  }
  
  loadContacts() {
    const _this = this;
    const promise = getAllUsersWithoutMe(_this.uId).then((users: User[]) => {
      return users.map((contact: User) =>
        countNewMessages(contact.id, _this.uId).then((data) => {
          // console.log(data)
          contact.newMessages = data.times;
          contact.lastMessage = data.lastMessage;
          return contact;
        })
      )
    });

    promise.then((promises) =>
      Promise.all(promises).then((users: User[]) => {
        // console.log(users)
        _this.contactUsers = users;
        _this.contactUsers.sort((a, b) => {
          if(!a.lastMessage) return 0; 
          if(!b.lastMessage) return -1;
          return b.lastMessage.id - a.lastMessage.id
        });
        if (_this.userActive === undefined && users.length > 0) {
          _this.userActive = users[0];
          _this.loadMessagesById(_this.userActive.id)
        }
      })
    );
  };

  changeUserActive(id) {
    const _this = this;
    if(id != _this.userActive.id) {
      console.log("Change user active: ", id)
      _this.textMessageRef.nativeElement.focus();
      _this.loadMessagesById(id)
      getUserById(id)
          .then(json => {
            _this.userActive = json
          })
          .catch(err => console.log(err.message))
    }
  }

  async loadMessagesById(id) {
    const _this = this;
    await findChatMessages(_this.uId, id)
      .then(json => {
        _this.messages = json
      })
      .catch(err => console.log(err.message))
  
    _this.loadContacts()
  }

  onImageUploadChange(event) {
    console.log(event.target.files )
    const _this = this;
    
    if(event.target.files && event.target.files.length) {
      const files = event.target.files;
      for(let i = 0; i < files.length; i++) {
        
        const reader = new FileReader();
        let file = files[i];

        reader.readAsDataURL(file);
    
        reader.onload = () => {
     
          let imageUrl = reader.result as string;
          let imagePreview: ImagePreview = {
            id: uuid.v4(),
            url: imageUrl
          }
          _this.imagePreviews.push(imagePreview)
        };
      }
    }
  }

  logout() {
    this.onDisconnect()
    this.router.navigate(['login'])
    console.log('isOnline: ', this.stompClient.connected)
  }

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event) {
    this.logout()
  }

  @HostListener('window:offline', ['$event'])
  onOffline() {
    console.log("ON OFFLINE")
    this.onDisconnect()
  }

  @HostListener('window:online', ['$event'])
  onOnline() {
    console.log("ON ONLINE")
    this.connect()
  }

  onDisconnect() {
    
    this.sendStatusUser(0)
    this.stompClient.disconnect();
  }

  sendStatusUser(status) {
    this.stompClient.send(`/app/users/status/${this.uId}/${status}`);
  }
}
