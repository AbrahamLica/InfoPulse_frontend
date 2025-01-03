import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/app/classes/environment';
import Usuario from 'src/app/classes/usuario';
import { ApiService } from 'src/app/services/api.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { AlertModalComponent } from 'src/app/util/alert-modal/alert-modal.component';
import { DialogService } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule, PanelModule, PasswordModule, AlertModalComponent, FloatLabelModule],
  providers: [DialogService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  credentials: { username?: string; password?: string; rememberMe?: boolean } = {
    rememberMe: true,
  };
  #document = inject(DOCUMENT);
  showPassword = false;
  value: string = '';
  isDarkMode = false;

  constructor(private usuarioService: UsuarioService, private apiService: ApiService, private http: HttpClient, private router: Router, private dialogService: DialogService) {
    const linkElement = this.#document.getElementById('app-theme') as HTMLLinkElement;
    if (linkElement.href.includes('light')) {
      this.isDarkMode = true;
    } else {
      this.isDarkMode = false;
    }

  }

  async login() {

    
    
    
    
    if (this.credentials) {
      try {
        const result = await this.http.post<{ id_token: string; user: Usuario }>(`${environment.urlBackend}authenticate`, this.credentials).toPromise();
        if (result) {
          this.usuarioService.setarDadosUsuario(result);
          this.router.navigateByUrl('/home');
        }
      } catch (e: any) {
        this.dialogService.open(AlertModalComponent, {
          header: 'Erro',
          width: '50%',
          data: {
            content: e?.error?.detail,
          },
        });
      }
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  registrarUsuario() {
    this.router.navigateByUrl('/registrar-usuario');
  }
}
