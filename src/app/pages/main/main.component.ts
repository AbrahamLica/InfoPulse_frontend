import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule], 
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {

  noticias: any[] | any = []

  constructor(private apiService: ApiService, private userService: UsuarioService) {
    this.init()
  }

  async init() {

    //@ts-ignore
    this.noticias = await this.apiService.makeGetRequest(`noticias?size=99999`)

    // console.log(this.noticias);
    
  }

  logout() {
    this.userService.deslogar()
  }

}
