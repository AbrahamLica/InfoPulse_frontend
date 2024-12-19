import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Noticia from 'src/app/classes/noticia';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TopBarComponent } from '../../util/top-bar/top-bar.component';
import { ImageModule } from 'primeng/image';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NoticiaService } from 'src/app/services/noticia.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-listar-noticia',
  standalone: true,
  imports: [TopBarComponent, ImageModule, CommonModule],
  templateUrl: './listar-noticia.component.html',
  styleUrl: './listar-noticia.component.scss',
})
export class ListarNoticiaComponent {
  noticia: Noticia = {};
  noticiaExterna: boolean = false;
  palavrasChave: any[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private noticiaService: NoticiaService
  ) {
    this.init();
  }

  async init() {
    window.scrollTo(0, 0);

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;

    if (state && state['noticia']) {
      this.noticia = state['noticia'];
      this.noticiaExterna = true;
    } else {
      this.route.paramMap.subscribe((params) => {
        const noticiaIdString = params.get('id');
        const noticiaId = noticiaIdString ? parseInt(noticiaIdString, 10) : null;

        if (noticiaId) {
          this.apiService.makeGetRequest(`noticias/${noticiaId}`).subscribe({
            next: (response: any) => {
              this.noticia = response;
              this.noticiaExterna = false;
              this.carregarPalavrasChave(noticiaId);
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

  getConteudoFormatado(): SafeHtml {
    if (!this.noticia || !this.noticia.conteudo) {
      return '';
    }

    const paragrafos = this.noticia.conteudo
      .split(/\n\n+/)
      .map((paragrafo) => `<p>${paragrafo.trim()}</p>`)
      .join('');

    return this.sanitizer.bypassSecurityTrustHtml(paragrafos);
  }

  carregarPalavrasChave(noticiaId: number) {
    this.apiService.makeGetRequest(`palavras-chaves?size=99999&noticiaId.equals=${noticiaId}`).subscribe({
      next: (response) => {
        let teste: any = response;
        teste.forEach((item: any) => {
          this.palavrasChave.push(item.palavra);
        });
      },
      error: (error) => {
        console.error('Erro ao carregar palavras-chave:', error);
      },
    });
  }

  getTextoComDestaque(item: Noticia): SafeHtml {
    const resumo = item.resumo;
    let textoComDestaque = resumo || '';

    this.palavrasChave.forEach((palavra) => {
      const regex = new RegExp(`\\b${palavra}\\b`, 'gi');
      const novoTextoComDestaque = textoComDestaque.replace(regex, `<span class="text-primary font-bold">${palavra}</span>`);
      textoComDestaque = novoTextoComDestaque;
    });

    return this.sanitizer.bypassSecurityTrustHtml(textoComDestaque);
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
