import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { AuthGuardService } from './services/auth-guard.service';
import { LoginComponent } from './pages/login/login.component';

@NgModule({
  imports: [
    RouterModule.forRoot(
      [
        {
          path: '',
          component: MainComponent,
          children: [
            { path: '', redirectTo: '/home', pathMatch: 'full' },
            { path: 'home', component: MainComponent },
          ],
          canActivate: [AuthGuardService],
        },
        {path: 'login', component: LoginComponent},
        {path: '**', redirectTo: '/notfound'},
      ],
      {
        useHash: false,
        onSameUrlNavigation: 'reload',
        enableTracing: false,
        scrollPositionRestoration: 'top',
      }
    ),
  ],
  exports: [RouterModule],
  providers: [AuthGuardService],
})
export class AppRoutingModule {}
