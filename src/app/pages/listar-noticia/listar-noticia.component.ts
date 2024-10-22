import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Noticia from 'src/app/classes/noticia';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
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
  noticiaExterna: boolean = false;

  constructor(private http: HttpClient, private apiService: ApiService, private route: ActivatedRoute, private router: Router) {
    this.init();
  }

  async init() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;

    if (state && state['noticia']) {
      this.noticia = state['noticia'];
      this.noticiaExterna = true;
    } else {
      this.route.paramMap.subscribe((params) => {
        const noticiaId = params.get('id');
        if (noticiaId) {
          this.apiService.makeGetRequest(`noticias/${noticiaId}`).subscribe({
            next: (response: any) => {
              this.noticia = response;
              this.noticiaExterna = false;
            },
            error: (error) => {
              console.error('Erro ao buscar notícia:', error);
              this.router.navigate(['/notfound']);
            },
          });
        } else {
          this.router.navigate(['/notfound']);
        }
      });
    }
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
    if (this.noticiaExterna) {
      console.log('n');
    } else {
      if (dataISO) {
        const horario = dataISO.split('T')[1].split('.')[0];
        return horario;
      }
    }
  }
}
