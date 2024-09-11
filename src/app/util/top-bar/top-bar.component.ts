import { Component } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { ImageModule } from 'primeng/image';
import { Router, RouterModule } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [ToolbarModule, AvatarModule, ImageModule, RouterModule, SidebarModule],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent {

  visibleSidebar: boolean = false;

  constructor(private router: Router,) {}

  goHome() {
    this.router.navigateByUrl('/home');
  }

  irParaPainelJornalista() {
    this.router.navigateByUrl('/painel-jornalista');
  }

}
