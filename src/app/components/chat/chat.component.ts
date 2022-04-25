
import { Component, HostListener, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as SockJS from 'sockjs-client';
import { Stomp, Client } from '@stomp/stompjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import * as uuid from 'uuid';

import {ChatNotification, FilePreview, Message, TypingNotification, User} from '../../interfaces/common'
import {
  getAllUsersWithoutMe,
  countNewMessages,
  getUserById,
  findChatMessages,
  findChatMessage,
  saveMessage,
  changeMessageStatus,
  uploadFiles
} from '../../utils/ApiUtil'
import { ScrollToBottomDirective } from 'src/app/utils/scroll-to-bottom.directive';
import { UploadFilesService } from 'src/app/services/UploadFilesService.service';

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
  private imagePreviews: FilePreview[] = [];
  private filePreviews: String[] = [];
  private fileImages: File[] = [];
  private fileOther: File[] = [];

  isPartnerTyping: boolean = false;


  constructor(private route: ActivatedRoute, private router: Router, private uploadFilesService: UploadFilesService){}

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
    // this.textMessageRef.nativeElement.focus();
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

    this.stompClient.subscribe(
      "/user/" + this.uId + "/messages/typing",
      this.onPartnerTyping.bind(this)
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
      findChatMessage(notification.chatId).then((message) => {
        _this.messages.push(message);
      });
    } else {
      // Notification message arrived
      _this.loadContacts()
    }
  }

  onPartnerTyping(payload) {
    const typingNotification: TypingNotification= JSON.parse(payload.body)
    if (this.userActive.id == typingNotification.senderId) {
      console.log("typingNotification", typingNotification)
      this.isPartnerTyping = typingNotification.typing;
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

  sendMessage(message: Message) {
    const _this = this;
    saveMessage(message)
      .then(res => {
        console.log(res);

        let chatNotification: ChatNotification = {
          chatId: res.id,
          senderId: res.senderId,
          senderName: res.senderName,
          recipientId: res.recipientId,
        }
        console.log(chatNotification)
        _this.stompClient.send("/app/chat", {}, JSON.stringify(chatNotification));

        changeMessageStatus(res.id, 'received')
          .then((json) => {
            _this.messages.pop();
            _this.messages.push(json);
          });

        _this.contactUsers = _this.contactUsers.filter(a => a.id != _this.userActive.id)
        _this.contactUsers.unshift(_this.userActive)

      })
      .catch(err => {
        console.log(err);
        _this.messages[_this.messages.length - 1].status = 'error';
        changeMessageStatus(_this.messages[_this.messages.length - 1].id, 'error')
          .then((json) => {
            _this.messages.pop();
            _this.messages.push(json);
          });
      })

  };

  handleSendMessage() {
    const _this = this
    let haveMessage = false;
    const message:Message = {
      senderId: _this.user.id,
      recipientId: _this.userActive.id,
      senderName: _this.user.username,
      recipientName: _this.userActive.username,
      timestamp: new Date(),
    };
    if (_this.text != null && _this.text.trim() !== "") {
      message.text = _this.text.trim();
      haveMessage = true;
    }
    // console.log(_this.imagePreviews)
    if(_this.fileImages.length > 0) {
      haveMessage = true;
    }

    if(_this.fileOther.length > 0) {
      haveMessage = true;
    }

    console.log(message)
    if(haveMessage) {

      // View loading message
      message.status = 'loading';
      _this.messages.push(message);
      console.log(_this.fileImages, _this.fileOther)
      const iLength = _this.fileImages.length
      let fileWrap = [..._this.fileImages, ..._this.fileOther];
      
      _this.uploadFilesService.uploadFile(fileWrap).subscribe(
        (filePaths: string[]) => {
          message.images = []
          message.files = []
          for(let i = 0; i < iLength; i++) {
            message.images.push(filePaths[i])
          }

          for(let i = iLength; i < filePaths.length; i++) {
            message.files.push(filePaths[i])
          }
          console.log(message.images, message.files)
          _this.sendMessage(message);
        }, err => {
          alert(err.message);
        }
      );
    }
    
    _this.text = '';
    _this.imagePreviews = [];
    _this.fileImages = [];
    _this.fileOther = [];
    _this.filePreviews = []
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
      return users.map((contact: User): Promise<User>[] => 
        countNewMessages(contact.id, _this.uId).then((data) => {
          // console.log(data)
          contact.newMessages = data.times;
          contact.lastMessage = data.lastMessage;
          return contact;
        })
      )
    });

    
    promise.then((promises: Promise<User>[]) =>
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
      // _this.textMessageRef.nativeElement.focus();
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
        console.log(json)
        json.forEach(message => {
          _this.messages.push( message );
        })

      })
      .catch(err => console.log(err.message))

    _this.loadContacts()
  }

  onImageUploadChange(event) {
    console.log(event.target.files )
    const _this = this;

    if(event.target.files && event.target.files.length) {
      const files = event.target.files;
      for(let i = 0; i <  files.length; i++) {
       
        const reader = new FileReader();
        let file =  files[i];
        _this.fileImages.push(file);

        reader.readAsDataURL(file);

        reader.onload = () => {

          let imageUrl = reader.result as string;
          let imagePreview: FilePreview = {
            id: uuid.v4(),
            url: imageUrl,
            fileName: file.name,
          }
          _this.imagePreviews.push(imagePreview)
        };
      }
    }
  }

  deleteImagePreview(imagePreview: FilePreview) {
    this.imagePreviews = this.imagePreviews.filter(i => i.id !== imagePreview.id)
    this.fileImages = this.fileImages.filter(file => file.name.localeCompare(imagePreview.fileName) != 0)
  }

  
  onFileUploadChange(event) {
    console.log(event.target.files )
    const _this = this;

    if(event.target.files && event.target.files.length) {
      const files = event.target.files;
      for(let i = 0; i <  files.length; i++) {
       _this.fileOther.push(files[i]);
       _this.filePreviews.push(files[i].name);
      }
    }
  }

  deleteFilePreview(filePreviewName: string) {
    console.log(filePreviewName)
    this.fileOther = this.fileOther.filter(file => file.name.localeCompare(filePreviewName) != 0)
    this.filePreviews = this.filePreviews.filter(filePreview => filePreview.localeCompare(filePreviewName) != 0)
  }

  textMessageFocus() {
    let typingNotification: TypingNotification = {
      senderId: this.uId,
      recipientId: this.userActive.id,
      typing: true
    }
    this.stompClient.send(`/app/chat/typing`, {}, JSON.stringify(typingNotification));
  }

  textMessageBlur() {
    let typingNotification: TypingNotification = {
      senderId: this.uId,
      recipientId: this.userActive.id,
      typing: false
    }
    this.stompClient.send(`/app/chat/typing`, {}, JSON.stringify(typingNotification));
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
