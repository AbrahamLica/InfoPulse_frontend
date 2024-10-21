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
import { readingTime } from 'reading-time-estimator';
import { Router } from '@angular/router';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, TopBarComponent, DataViewModule, DataViewComponent, TagModule, ImageModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  noticiasBackend: Noticia[] = [];
  noticiasExternas: Noticia[] = [];
  noticiasFinal: Noticia[] = [];
  tempoDeLeitura: any;

  constructor(private apiService: ApiService, private userService: UsuarioService, private router: Router) {
    this.init();
  }

  init() {
    let urlApi = 'https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=2d3505ce59684209a8f722d1ba0856ea';

    // Fazer as duas requisições em paralelo
    forkJoin({
      noticiasExternas: this.apiService.makeGetRequestApi(urlApi),
      noticiasBackend: this.apiService.makeGetRequest('noticias?size=99999'),
    }).subscribe({
      next: (response: any) => {
        // Transformando as notícias externas para o formato de `Noticia`
        this.noticiasExternas = response.noticiasExternas.articles.map((article: any) => {
          const noticiaExterna: Noticia = {
            titulo: article.title,
            conteudo: article.content,
            resumo: article.description,
            dataPublicacao: article.publishedAt,
            autor: article.author,
            imagemContentType: article.urlToImage,
            categoria: article.source?.name,
            tempoDeLeitura: readingTime(article.content ?? '', 10, 'pt-br').text,
          };
          return noticiaExterna;
        });

        // Pegando as notícias do backend e calculando tempo de leitura
        this.noticiasBackend = response.noticiasBackend.map((noticia: Noticia) => {
          noticia.tempoDeLeitura = readingTime(noticia.conteudo ?? '', 10, 'pt-br').text;
          return noticia;
        });

        // Unindo as duas listas de notícias
        this.noticiasFinal = [...this.noticiasBackend, ...this.noticiasExternas];
      },
      error: (error) => {
        console.error('Erro ao buscar notícias:', error);
      },
      complete: () => {
        console.info('Requisição de notícias completada.');
        console.log(this.noticiasFinal);
      },
    });

    console.log(this.noticiasFinal);
  }

  irParaNoticiaCompleta(item: any) {
    this.router.navigate(['/noticia', item.id]);
  }

  logout() {
    this.userService.deslogar();
  }

  extractDateOnly(dateTime: any): string {
    if (!dateTime) {
      return '';
    }

    let date;
    if (dateTime instanceof Date) {
      date = dateTime;
    } else {
      date = new Date(dateTime);
    }

    if (isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} Horas atrás`;
    }

    if (diffInDays <= 30) {
      const days = Math.floor(diffInDays);
      return `${days} dias atrás`;
    }

    const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day} de ${month} de ${year}`;
  }
}
