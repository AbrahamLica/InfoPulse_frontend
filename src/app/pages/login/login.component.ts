import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router} from '@angular/router';
import { environment } from 'src/app/classes/environment';
import Usuario from 'src/app/classes/usuario';
import { ApiService } from 'src/app/services/api.service'; 
import { UsuarioService } from 'src/app/services/usuario.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule, PanelModule, PasswordModule, RippleModule ], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  credentials: { username?: string; password?: string; rememberMe?: boolean } = {
    rememberMe: true,
  };

  showPassword = false;

  constructor(
    private usuarioService: UsuarioService,
    private apiService: ApiService,
    private http: HttpClient,
    private router: Router // Router agora pode ser injetado corretamente
  ) {}

  async login() {
    if (this.credentials) {
      try {
        const result = await this.http
          .post<{ id_token: string; usuario: Usuario }>(
            `${environment.urlBackend}authenticate`,
            this.credentials
          )
          .toPromise();
        if (result) {
          this.usuarioService.setarDadosUsuario(result);
          this.router.navigateByUrl('/home');
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
