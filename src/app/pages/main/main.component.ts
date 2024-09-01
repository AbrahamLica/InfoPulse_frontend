import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-main',
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

    console.log(this.noticias);
    
  }

}
