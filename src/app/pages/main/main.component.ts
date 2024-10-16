import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TopBarComponent } from '../../util/top-bar/top-bar.component';
import { DataViewModule } from 'primeng/dataview';
import { DataViewComponent } from '../../util/data-view/data-view.component';
import { TagModule } from 'primeng/tag';
import Noticia from 'src/app/classes/noticia';
import { ImageModule } from 'primeng/image';
import { readingTime } from 'reading-time-estimator'

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    TopBarComponent,
    DataViewModule,
    DataViewComponent,
    TagModule,
    ImageModule
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {

  noticias: Noticia[] = [];
  tempoDeLeitura: any

  constructor(
    private apiService: ApiService,
    private userService: UsuarioService,
  ) {
    this.init();
  }

  async init() {
    //@ts-ignore
    this.noticias = await this.apiService.makeGetRequest(`noticias?size=99999`);

    this.noticias.forEach(noticia => {
      //@ts-ignore
      noticia.tempoDeLeitura = readingTime(noticia.conteudo, 10, 'pt-br').text
    })
  }


  irParaNoticiaCompleta(item:any) {

  }


  logout() {
    this.userService.deslogar();
  }



  extractDateOnly(dateTime: any): string {
    if (!dateTime) {
      return '';
    }

    // Converte o input para objeto Date se não for um Date já
    let date;
    if (dateTime instanceof Date) {
      date = dateTime;
    } else {
      date = new Date(dateTime);
    }

    // Se a data for inválida, retorne vazio
    if (isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60); // Diferença em horas
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24); // Diferença em dias

    // Se a diferença for menor que 24 horas, retorna em horas
    if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} Horas atrás`;
    }

    // Se a diferença for menor que 30 dias, retorna em dias
    if (diffInDays <= 30) {
      const days = Math.floor(diffInDays);
      return `${days} dias atrás`;
    }

    // Se a diferença for maior que 30 dias, retorna a data no formato Brasileiro
    const monthNames = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];

    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day} de ${month} de ${year}`;
  }


}
