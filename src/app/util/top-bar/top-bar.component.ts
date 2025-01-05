import { Component, inject, ViewChild } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { ImageModule } from 'primeng/image';
import { Router, RouterModule } from '@angular/router';
import { Sidebar, SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { UsuarioService } from 'src/app/services/usuario.service';
import { DialogService } from 'primeng/dynamicdialog';
import { PainelUsuarioComponent } from 'src/app/pages/painel-usuario/painel-usuario.component';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [
    ToolbarModule,
    MenuModule,
    AvatarModule,
    ImageModule,
    RouterModule,
    SidebarModule,
    ButtonModule,
    RippleModule,
    StyleClassModule,
    InputSwitchModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
})
export class TopBarComponent {
  #document = inject(DOCUMENT);
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;
  items: MenuItem[] | undefined;
  linkElement = this.#document.getElementById('app-theme') as HTMLLinkElement;

  closeCallback(e: any): void {
    this.sidebarRef.close(e);
  }

  sidebarVisible: boolean = false;
  isDarkMode = false;

  constructor(
    private dialogService: DialogService,
    private router: Router,
    private usuarioService: UsuarioService,
    private apiService: ApiService
  ) {
    if (this.linkElement.href.includes('light')) {
      this.isDarkMode = false;
    } else {
      this.isDarkMode = true;
    }

    let usuario: any = '';

    this.apiService
      .makeGetRequest(
        `usuarios?size=99999&userId.equals=${
          this.usuarioService.getDadosUsuario()?.user?.id
        }`
      )
      .subscribe({
        next: async (response: any) => {
          usuario = response[0];

          this.items = [
            {
              label: usuario?.nome,
              items: [
                {
                  label: 'Painel do usuário',
                  icon: 'pi pi-user',
                  command: () => {
                    this.irParaPainelUsuario();
                  },
                },
                {
                  label: 'Deslogar',
                  icon: 'pi pi-sign-out',
                  command: () => {
                    this.usuarioService.deslogar();
                  },
                },
              ],
            },
          ];
        },
        error: (e) => {

          console.log("deu erro");
          

          console.log(this.usuarioService.getDadosUsuario()?.user?.firstName);
          
          this.items = [
            {
              label: this.usuarioService.getDadosUsuario()?.user?.firstName,
              items: [
                {
                  label: 'Deslogar',
                  icon: 'pi pi-sign-out',
                  command: () => {
                    this.usuarioService.deslogar();
                  },
                },
              ],
            },
          ];
          
        }
      });
  }

  irParaPainelUsuario() {
    this.dialogService.open(PainelUsuarioComponent, {
      width: '50%',
    });
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  irParaPainelJornalista() {
    this.router.navigateByUrl('/painel-jornalista');
  }

  toggleLightDark() {
    if (this.linkElement.href.includes('light')) {
      this.linkElement.href = 'theme-dark.css';
      this.isDarkMode = true;
    } else if (this.linkElement.href.includes('dark')) {
      this.linkElement.href = 'theme-light.css';
      this.isDarkMode = false;
    }
  }
}
