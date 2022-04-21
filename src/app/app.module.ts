import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignupComponent } from './components/signup/signup.component';
import { ChatComponent } from './components/chat/chat.component';
import { SigninComponent } from './components/signin/signin.component';
import { ImagesPreviewComponent } from './components/chat/images-preview/images-preview.component';

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    ChatComponent,
    SigninComponent,
    ImagesPreviewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
