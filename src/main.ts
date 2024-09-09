import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/pages/login/login.component';
import { MainComponent } from './app/pages/main/main.component';
import { AuthGuardService } from './app/services/auth-guard.service';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC79TlmeowXQ6beGgu3C_KzWr2wZt5G6vg",
  authDomain: "galeria-ccb52.firebaseapp.com",
  projectId: "galeria-ccb52",
  storageBucket: "galeria-ccb52.appspot.com",
  messagingSenderId: "555170457547",
  appId: "1:555170457547:web:be097c66ae9db63439384e",
};

// Rotas
const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: 'home', component: MainComponent },
    ],
    canActivate: [AuthGuardService],
  },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '/notfound' },
];

// Bootstrap da aplicação
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      FormsModule,
      BrowserAnimationsModule,
      BrowserModule,
      ButtonModule,
      RippleModule,
      RouterModule.forRoot(routes),
    ),
    provideHttpClient(withInterceptorsFromDi()),
    AuthGuardService,
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideStorage(() => getStorage()),
    provideFirestore(() => getFirestore()),
  ],
}).catch((err) => console.error(err));
