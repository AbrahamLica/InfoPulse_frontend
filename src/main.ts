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
import { PainelJornalistaComponent } from './app/pages/painel-jornalista/painel-jornalista.component';
import { IMAGE_CONFIG } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { ListarNoticiaComponent } from './app/pages/listar-noticia/listar-noticia.component';
import { NotfoundComponent } from './app/pages/notfound/notfound.component';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyC79TlmeowXQ6beGgu3C_KzWr2wZt5G6vg',
  authDomain: 'galeria-ccb52.firebaseapp.com',
  projectId: 'galeria-ccb52',
  storageBucket: 'galeria-ccb52.appspot.com',
  messagingSenderId: '555170457547',
  appId: '1:555170457547:web:be097c66ae9db63439384e',
};

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: MainComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'painel-jornalista',
    component: PainelJornalistaComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'noticia',
    component: ListarNoticiaComponent,
    canActivate: [AuthGuardService], // Verifique se a rota está protegida
  },
  {
    path: 'noticia/:id',
    component: ListarNoticiaComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'notfound',
    component: NotfoundComponent,
  },
  {
    path: '**', // Rota coringa
    redirectTo: '/notfound',
  },
];

// Bootstrap da aplicação
bootstrapApplication(AppComponent, {
  providers: [
    DialogService,
    importProvidersFrom(FormsModule, BrowserAnimationsModule, BrowserModule, ButtonModule, RippleModule, RouterModule.forRoot(routes)),
    provideHttpClient(withInterceptorsFromDi()),
    AuthGuardService,
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideStorage(() => getStorage()),
    provideFirestore(() => getFirestore()),
    { provide: IMAGE_CONFIG, useValue: { disableImageSizeWarning: true, disableImageLazyLoadWarning: true } },
  ],
}).catch((err) => console.error(err));
