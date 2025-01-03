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
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FooterComponent } from '../footer/footer.component';
import { NoticiaService } from 'src/app/services/noticia.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, TopBarComponent, DataViewModule, DataViewComponent, TagModule, ImageModule, ProgressSpinnerModule, FooterComponent],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  noticiasBackend: Noticia[] = [];
  noticiasExternas: Noticia[] = [];
  noticiasFinal: Noticia[] = [];
  tempoDeLeitura: any;
  loading: boolean = true;
  palavrasChaveMap: Map<number, any[]> = new Map();
  latitude: any;
  longitude: any;

  constructor(private sanitizer: DomSanitizer, private apiService: ApiService, private userService: UsuarioService, private router: Router, private noticiaService: NoticiaService) {
    this.init();
  }

  decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  init() {
    if (this.noticiaService.getNoticiasExternas().length > 0 && this.noticiaService.getNoticiasInternas().length > 0) {
      this.loading = true;
      this.noticiasExternas = this.noticiaService.getNoticiasExternas();
      this.noticiasBackend = this.noticiaService.getNoticiasInternas();
      this.noticiasFinal = [...this.noticiasBackend, ...this.noticiasExternas];
      this.loading = false;
      return;
    }

    // Caso contrário, carregue as notícias
    forkJoin({
      noticiasExternas: this.apiService.makeGetRequestApi('https://api.worldnewsapi.com/top-news?source-country=us&language=en&api-key=52347244a1aa47c1bb7627b5d2a82660').pipe(
        catchError((error) => {
          console.error('Erro ao carregar notícias externas:', error);
          return of([]);
        })
      ),
      noticiasBackend: this.apiService.makeGetRequest('noticias?size=99999').pipe(
        catchError((error) => {
          console.error('Erro ao carregar notícias do backend:', error);
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
              url: article.news[0].url,
            };
            return noticiaExterna;
          }) || [];

        this.noticiasBackend = response.noticiasBackend
          .filter((noticia: Noticia) => noticia.ativo !== false)
          .map((noticia: Noticia) => {
            noticia.tempoDeLeitura = readingTime(noticia.conteudo ?? '', 10, 'pt-br').text;
            return noticia;
          });

        // Armazene os dados no serviço
        this.noticiaService.setNoticiasExternas(this.noticiasExternas);
        this.noticiaService.setNoticiasInternas(this.noticiasBackend);
      },
      complete: () => {
        this.noticiasFinal = [...this.noticiasBackend, ...this.noticiasExternas];
        this.loading = false;
      },
    });
  }

  obterClimaAtual() {
    let latitude;
    let longitude;
    let endpointApi = 'http://api.weatherapi.com/v1/current.json?key=';
    let tokenAPi = '476acf1b07f24b0c8fb180939243010';

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        },
        (error) => {
          console.error('Erro ao obter localização:', error.message);
        }
      );
    } else {
      console.error('Geolocalização não é suportada neste navegador.');
    }
  }

  carregarPalavrasChave(noticiaId: number) {
    if (!this.palavrasChaveMap.has(noticiaId)) {
      this.apiService.makeGetRequest(`palavras-chaves?size=99999&noticiaId.equals=${noticiaId}`).subscribe({
        next: (response) => {
          //@ts-ignore
          this.palavrasChaveMap.set(noticiaId, response);
        },
        error: (error) => {
          console.error('Erro ao carregar palavras-chave:', error);
        },
      });
    }
  }

  getTextoComDestaque(item: Noticia): SafeHtml {
    //@ts-ignore
    const palavrasChave = this.palavrasChaveMap.get(item.id) || [];
    //@ts-ignore
    const resumo = item.resumo.length > 150 ? item.resumo.slice(0, 150) + '...' : item.resumo;
    let textoComDestaque = resumo;

    palavrasChave.forEach((palavra) => {
      const regex = new RegExp(`\\b(${palavra.palavra})\\b`, 'gi'); // Garante que a palavra completa seja destacada
      //@ts-ignore
      textoComDestaque = textoComDestaque.replace(regex, `<span class="text-primary font-bold">$1</span>`);
    });
    //@ts-ignore
    return this.sanitizer.bypassSecurityTrustHtml(textoComDestaque);
  }

  irParaNoticiaCompleta(item: Noticia) {
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
