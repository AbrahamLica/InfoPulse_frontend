import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Noticia from 'src/app/classes/noticia';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { TopBarComponent } from '../../util/top-bar/top-bar.component';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-listar-noticia',
  standalone: true,
  imports: [TopBarComponent, ImageModule],
  templateUrl: './listar-noticia.component.html',
  styleUrl: './listar-noticia.component.scss',
})
export class ListarNoticiaComponent {
  noticia: Noticia = {};

  constructor(private http: HttpClient, private apiService: ApiService, private route: ActivatedRoute) {
    this.init();
  }

  async init() {
    this.route.paramMap.subscribe(async (params) => {
      const noticiaId = params.get('id'); // Captura o ID da rota
      if (noticiaId) {
        //@ts-ignore
        this.noticia = await this.apiService.makeGetRequest(`noticias/${noticiaId}`);
      }
    });
  }

  extractDateOnly(dateTime: any): string {
    if (!dateTime) {
      return '';
    }

    // Se for um objeto Date, converte para string ISO
    if (dateTime instanceof Date) {
      dateTime = dateTime.toISOString().split('T')[0];
    }

    // Se ainda não for string, converte para string
    if (typeof dateTime !== 'string') {
      dateTime = String(dateTime);
    }

    // Verifica se é uma string no formato ISO e extrai a data
    let datePart = '';
    if (dateTime.includes('T')) {
      datePart = dateTime.split('T')[0];
    } else if (dateTime.includes(' ')) {
      datePart = dateTime.split(' ')[0];
    } else {
      datePart = dateTime;
    }

    // Converte de yyyy-mm-dd para dd/mm/yyyy
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  }

  extractTimeOnly(dataISO: string): any {
    if (dataISO) {
      const horario = dataISO.split('T')[1].split('.')[0];
      return horario;
    }
  }
}
