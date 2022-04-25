import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
// import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignupComponent } from './components/signup/signup.component';
import { ChatComponent } from './components/chat/chat.component';
import { SigninComponent } from './components/signin/signin.component';
import { ImagesPreviewComponent } from './components/chat/images-preview/images-preview.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { FilesPreviewComponent } from './components/chat/files-preview/files-preview.component';

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    ChatComponent,
    SigninComponent,
    ImagesPreviewComponent,
    SpinnerComponent,
    FilesPreviewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    // provideFirebaseApp(() => initializeApp({ ... })),
    // provideFirestore(() => getFirestore()),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
