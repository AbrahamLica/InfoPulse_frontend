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

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [ToolbarModule, MenuModule, AvatarModule, ImageModule, RouterModule, SidebarModule, ButtonModule, RippleModule, StyleClassModule, InputSwitchModule, FormsModule, CommonModule],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
})
export class TopBarComponent {
  #document = inject(DOCUMENT);
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;
  items: MenuItem[] | undefined;

  closeCallback(e: any): void {
    this.sidebarRef.close(e);
  }

  sidebarVisible: boolean = false;
  isDarkMode = false;

  constructor(private dialogService: DialogService, private router: Router, private usuarioService: UsuarioService) {
    let usuario = this.usuarioService.getDadosUsuario();

    this.items = [
      {
        label: usuario?.user?.login,
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
    const linkElement = this.#document.getElementById('app-theme') as HTMLLinkElement;
    if (linkElement.href.includes('light')) {
      linkElement.href = 'theme-dark.css';
      this.isDarkMode = true;
    } else {
      linkElement.href = 'theme-light.css';
      this.isDarkMode = false;
    }
  }
}
