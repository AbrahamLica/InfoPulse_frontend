import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/app/classes/environment';
import Usuario from 'src/app/classes/usuario';
import { ApiService } from 'src/app/services/api.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  credentials: { username?: string; password?: string; rememberMe?: boolean } =
    {
      rememberMe: true,
    };

    showPassword = false;

  constructor(
    private usuarioService: UsuarioService,
    private apiService: ApiService,
    private http: HttpClient,
    private router: Router
  ) {}

  async login() {
    if(this.credentials) {

    }
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
