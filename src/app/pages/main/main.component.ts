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
import { catchError, forkJoin, map, of } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, TopBarComponent, DataViewModule, DataViewComponent, TagModule, ImageModule, ProgressSpinnerModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  noticiasBackend: Noticia[] = [];
  noticiasExternas: Noticia[] = [];
  noticiasFinal: Noticia[] = [];
  tempoDeLeitura: any;
  loading: boolean = true;

  constructor(private apiService: ApiService, private userService: UsuarioService, private router: Router) {
    this.init();
  }

  decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  onImageError(event: any) {
    // Defina a URL da imagem padrão que será exibida em caso de erro
    event.target.src = 'assets/default-news.jpeg';
  }

  init() {
    let urlApi = 'https://api.worldnewsapi.com/top-news?source-country=us&language=en&api-key=52347244a1aa47c1bb7627b5d2a82660';

    forkJoin({
      noticiasExternas: this.apiService.makeGetRequestApi(urlApi).pipe(
        catchError((error) => {
          console.error('Erro ao buscar notícias externas:', error);
          return of([]);
        })
      ),
      noticiasBackend: this.apiService.makeGetRequest('noticias?size=99999').pipe(
        catchError((error) => {
          console.error('Erro ao buscar notícias do backend:', error);
          return of([]);
        })
      ),
    }).subscribe({
      next: (response: any) => {
        this.noticiasExternas =
          response.noticiasExternas.top_news?.map((article: any) => {
            const noticiaExterna: Noticia = {
              titulo: article.news[0].title,
              conteudo: this.decodeHtml(article.news[0].text),
              resumo: this.decodeHtml(article.news[0].summary),
              dataPublicacao: article.news[0].publish_date,
              autor: article.news[0].author,
              imagemContentType: article.news[0].image,
              categoria: article.news[0].source_country,
              tempoDeLeitura: readingTime(article.news[0].text ?? '', 10, 'pt-br').text,
            };
            return noticiaExterna;
          }) || [];

        this.noticiasBackend = response.noticiasBackend.map((noticia: Noticia) => {
          noticia.tempoDeLeitura = readingTime(noticia.conteudo ?? '', 10, 'pt-br').text;
          return noticia;
        });
      },
      error: (error) => {
        console.error('Erro ao buscar notícias:', error);
      },
      complete: () => {
        this.noticiasFinal = [...this.noticiasBackend, ...this.noticiasExternas];
        this.loading = false;
      },
    });
  }

  irParaNoticiaCompleta(item: Noticia) {
    console.log('Navegando para notícia', item);
    if (item.id) {
      this.router.navigate(['/noticia', item.id]);
    } else {
      this.router.navigate(['/noticia'], { state: { noticia: item } });
    }
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
      // Criar um objeto de data ajustando o fuso horário para UTC-3 (horário de Brasília)
      date = new Date(dateTime);
    }

    if (isNaN(date.getTime())) {
      return '';
    }

    // Ajustar o horário para o fuso de Brasília (UTC-3)
    const brazilTimezoneOffset = -3; // UTC-3
    date.setHours(date.getHours() + brazilTimezoneOffset);

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
