import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import { AppComponent } from './app/app.component';
import { FooterComponent } from './app/pages/footer/footer.component';
import { HeaderComponent } from './app/pages/header/header.component';
import { LoginComponent } from './app/pages/login/login.component';
import { MainComponent } from './app/pages/main/main.component';
import { AuthGuardService } from './app/services/auth-guard.service';

// Definição das rotas
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

// Bootstrap da aplicação com configuração das rotas e módulos
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      FormsModule,
      BrowserAnimationsModule,
      ButtonModule,
      RouterModule.forRoot(routes, {
        useHash: false,
        onSameUrlNavigation: 'reload',
        enableTracing: false,
        scrollPositionRestoration: 'top',
      })
    ),
    provideHttpClient(withInterceptorsFromDi()),
    AuthGuardService,
  ],
}).catch((err) => console.error(err));
