
import { Component, ViewChild } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { ActivatedRoute, ParamMap } from '@angular/router';

import {Message, User} from '../../interfaces/common'
import {
  getAllUsersWithoutMe,
  countNewMessages, 
  getUserById,
  findChatMessages,
  findChatMessage,
  ChangeMessageStatus
} from '../../utils/ApiUtil'
import { ScrollToBottomDirective } from 'src/app/utils/scroll-to-bottom.directive';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  
  // @ViewChild(ScrollToBottomDirective)
  scroll: ScrollToBottomDirective;
  
  title = 'WebSocketChatRoom';

  private stompClient = null;
  private uId: number;
  private user: User;
  private userActive: User;
  private contactUsers: User[] = [];
  private messages: Message[] = [];
  private text: string;


  constructor(private router: ActivatedRoute){}

  ngOnInit() {
    this.router.paramMap.subscribe((params: ParamMap) => {
      this.uId = +params.get('id')
      getUserById(this.uId)
        .then(json => {
          _this.user = json
        })
        .catch(err => console.log(err.message))
    
    })
    const _this = this;
   
    this.connect();
    this.loadContacts();
  }

  connect() {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);

    const _this = this;
    this.stompClient.connect({}, _this.onConnected.bind(_this), _this.onError)
  }

  onConnected(frame) {
    console.log('Connected: ' + frame);
    this.stompClient.subscribe(
      "/user/" + this.uId + "/queue/messages", 
      this.onMessageReceived.bind(this)
    );
  }

  onError(err) {
    console.log(err);
  };

  onMessageReceived(msg) {
    const _this = this;
    const notification = JSON.parse(msg.body);
    
    if (this.userActive.id == notification.senderId) {
      console.log(notification)
      findChatMessage(notification.id).then((message) => {
        _this.messages.push(message);
      });
    } else {
      // Notification message arrived
      _this.loadContacts()
    }
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
    console.log(event)
    if(event.keyCode === 13) {
      this.handleSendMessage()
    }

    return true
  }
  
  loadContacts() {
    const _this = this;
    const promise = getAllUsersWithoutMe(_this.uId).then((users) => {
      return users.map((contact) =>
        countNewMessages(contact.id, _this.uId).then((data) => {
          console.log(data)
          contact.newMessages = data.times;
          contact.lastMessage = data.lastMessage;
          return contact;
        })
      )}
    );

    promise.then((promises) =>
      Promise.all(promises).then((users) => {
        users.sort((a, b) => {
          if(!a.lastMessage) return 0; 
          if(!b.lastMessage) return -1;
          return b.lastMessage.id - a.lastMessage.id
        });
        _this.contactUsers = users;
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
}
