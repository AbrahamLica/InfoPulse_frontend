import { Component, ViewChild } from '@angular/core';
import { DataViewModule } from 'primeng/dataview';
import { DataViewComponent } from '../../util/data-view/data-view.component';
import { ImageModule } from 'primeng/image';
import Noticia from 'src/app/classes/noticia';
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CriarNoticiaComponent } from '../criar-noticia/criar-noticia.component';
import _ from 'lodash';
import { AlertService } from 'src/app/services/alert.service';
import { ConfirmModalComponent } from 'src/app/util/confirm-modal/confirm-modal.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { TopBarComponent } from 'src/app/util/top-bar/top-bar.component';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { ListarCategoriasComponent } from '../listar-categorias/listar-categorias.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import PalavraChave from 'src/app/classes/palavraChave';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-painel-jornalista',
  standalone: true,
  imports: [
    DataViewModule,
    DataViewComponent,
    ImageModule,
    CommonModule,
    ToolbarModule,
    ButtonModule,
    ToastModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    TopBarComponent,
    CalendarModule,
    FormsModule,
  ],
  providers: [DialogService, DynamicDialogRef, AlertService, DynamicDialogConfig, MessageService],
  templateUrl: './painel-jornalista.component.html',
  styleUrl: './painel-jornalista.component.scss',
})
export class PainelJornalistaComponent {
  @ViewChild('dv') dv!: DataView;

  noticias: Noticia[] = [];
  filteredNoticias: Noticia[] = [];
  campoPesquisa: string = '';
  hoje: Date = new Date();
  today: Date = new Date();
  dataInicial: Date | undefined;
  dataFinal: Date | undefined;
  palavrasChaveMap: Map<number, any[]> = new Map();

  constructor(
    private sanitizer: DomSanitizer,
    private apiService: ApiService,
    private userService: UsuarioService,
    private dialogService: DialogService,
    private alertService: AlertService,
    private messageService: MessageService
  ) {
    this.init();
  }

  async init() {
    this.apiService.makeGetRequest<Noticia[]>('noticias?size=999999').subscribe({
      next: (response: Noticia[]) => {
        this.noticias = response;
        this.noticias.forEach((noticia: Noticia) => {
          if (noticia.id) {
            this.carregarPalavrasChave(noticia.id);
          }
        });
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        this.filteredNoticias = this.noticias;
      },
    });
  }

  async carregarPalavrasChave(noticiaId: number) {
    if (!this.palavrasChaveMap.has(noticiaId)) {
      this.apiService.makeGetRequest(`palavras-chaves?size=99999&noticiaId.equals=${noticiaId}`).subscribe({
        next: (response: any) => {
          this.palavrasChaveMap.set(noticiaId, response);
        },
        error: (error) => {
          console.error(error);
        },
      });
    } else {
      this.apiService.makeGetRequest(`palavras-chaves?size=99999&noticiaId.equals=${noticiaId}`).subscribe({
        next: (response: any) => {
          this.palavrasChaveMap.set(noticiaId, response);
        },
        error: (error) => {
          console.error('Erro ao carregar palavras-chave:', error);
        },
      });
    }
  }

  getTextoComDestaque(item: Noticia): SafeHtml {
    let palavrasChave: any;
    let resumo;

    if (item.id) {
      palavrasChave = this.palavrasChaveMap.get(item.id) || [];
    }

    if (item.resumo) {
      resumo = item.resumo.length > 150 ? item.resumo.slice(0, 150) + '...' : item.resumo;
    }

    let textoComDestaque = resumo;

    palavrasChave.forEach((palavra: any) => {
      const regex = new RegExp(`\\b(${palavra.palavra})\\b`, 'gi');
      if (textoComDestaque) {
        textoComDestaque = textoComDestaque.replace(regex, `<span class="text-primary font-bold">$1</span>`);
      }
    });
    //@ts-ignore
    return this.sanitizer.bypassSecurityTrustHtml(textoComDestaque);
  }

  onFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value.toLowerCase() || '';

    this.campoPesquisa = value;
    this.filteredNoticias = this.noticias.filter((noticia) => {
      return noticia?.titulo?.toLowerCase().includes(value);
    });
  }

  excluirNoticia(item: any) {
    let ref = this.dialogService.open(ConfirmModalComponent, {
      header: 'Excluir',
      width: '50%',
      data: { content: 'Deseja excluir a noticia selecionada?' },
    });

    ref.onClose.subscribe(async (resposta: boolean) => {
      if (resposta) {
        this.apiService.makeGetRequest(`palavras-chaves?size=99999&noticiaId.equals=${item.id}`).subscribe({
          next: async (palavrasChaves: any) => {
            // Agora que temos todas as palavras-chave associadas, podemos excluir uma por uma.
            for (let palavraChave of palavrasChaves) {
              await lastValueFrom(this.apiService.makeDeleteRequest(`palavras-chaves/${palavraChave.id}`));
            }

            // Excluindo a notícia.
            this.apiService.makeDeleteRequest(`noticias/${item.id}`).subscribe({
              next: () => {
                // Atualizando o estado das notícias.
                this.noticias = this.noticias.filter((value) => value.id !== item.id);
                this.filteredNoticias = this.filteredNoticias.filter((value) => value.id !== item.id);

                this.messageService.add({
                  severity: 'success',
                  summary: 'Notícia excluída com sucesso!',
                  icon: 'pi-check',
                  key: 'tc',
                  life: 3000,
                });
              },
              error: (error) => {
                console.error(error);
              },
            });
          },
          error: (error) => {
            console.error(error);
          },
        });
      }
    });
  }

  async criarNoticia(noticiaForm?: Noticia, palavrasChavesUnicas?: any, palavrasChaveAntes?: any) {
    let caixaDeDialogo = this.dialogService.open(CriarNoticiaComponent, {
      header: noticiaForm ? (noticiaForm.id ? 'Editar' : 'Cadastrar') : 'Cadastrar',
      width: '70%',
      data: {
        noticiaForm: noticiaForm || new Noticia(),
        palavrasChavesUnicas: palavrasChavesUnicas,
        palavrasChaveAntes: palavrasChaveAntes,
      },
    });

    caixaDeDialogo.onClose.subscribe(async (data) => {
      if (data) {
        const noticia = data.noticiaForm;
        const palavrasChavesUnicas = data.palavrasChavesUnicas || [];
        const palavrasChaveAntes = data.palavrasChaveAntes || [];
        let noticiaSaved: any;

        if (noticia?.id) {
          this.apiService.makePutRequest(`noticias/${noticia.id}`, noticia).subscribe({
            next: async (response: any) => {
              noticiaSaved = response;
              await Promise.all(palavrasChaveAntes.map((item: any) => lastValueFrom(this.apiService.makeDeleteRequest(`palavras-chaves/${item.id}`))));

              for (let palavraChave of palavrasChavesUnicas) {
                const palavraChaveObj: PalavraChave = {
                  palavra: palavraChave.palavra,
                  noticia: { id: noticiaSaved.id },
                };
                await this.apiService.makePostRequest('palavras-chaves', palavraChaveObj).toPromise();
              }

              setTimeout(async () => {
                await this.carregarPalavrasChave(noticiaSaved.id);
              }, 200);
            },
            error: (error) => console.log(error),
            complete: async () => {
              if (noticiaSaved) {
                this.noticias = this.noticias.map((noticia) => (noticia.id === noticiaSaved.id ? noticiaSaved : noticia));
                this.filteredNoticias = this.filteredNoticias.map((noticia) => (noticia.id === noticiaSaved.id ? noticiaSaved : noticia));

                this.messageService.add({
                  severity: 'success',
                  summary: 'Notícia editada com sucesso!',
                  icon: 'pi-check',
                  key: 'tl',
                  life: 3000,
                });
              }
            },
          });
        } else {
          this.apiService.makePostRequest('noticias', noticia).subscribe({
            next: async (response: any) => {
              noticiaSaved = response;
              for (let palavraChave of palavrasChavesUnicas) {
                const palavraChaveObj: PalavraChave = {
                  palavra: palavraChave.palavra,
                  noticia: { id: noticiaSaved.id },
                };
                await this.apiService.makePostRequest('palavras-chaves', palavraChaveObj).toPromise();
              }
            },
            error: (error) => console.log(error),
            complete: () => {
              if (noticiaSaved) {
                this.noticias = [...this.noticias, noticiaSaved];
                this.filteredNoticias = [...this.filteredNoticias, noticiaSaved];
                setTimeout(async () => {
                  await this.carregarPalavrasChave(noticiaSaved.id);
                }, 200);

                this.messageService.add({
                  severity: 'success',
                  summary: 'Notícia criada com sucesso!',
                  icon: 'pi-check',
                  key: 'tl',
                  life: 3000,
                });
              }
            },
          });
        }
      }
    });
  }

  listarCategorias() {
    this.dialogService.open(ListarCategoriasComponent, {
      width: '70%',
    });
  }

  toLocalDate(data: any) {
    if (data instanceof Date) {
      data.setUTCHours(3);
      return data.toLocaleDateString('pt-BR', { timeZone: 'America/Belem' });
    } else {
      console.error('Data não é uma instância de Date', data);
      return null;
    }
  }

  extractDateOnly(dateTime: any): string {
    if (!dateTime) {
      return '';
    }
    if (dateTime instanceof Date) {
      dateTime = dateTime.toISOString().split('T')[0];
    }
    if (typeof dateTime !== 'string') {
      dateTime = String(dateTime);
    }
    let datePart = '';
    if (dateTime.includes('T')) {
      datePart = dateTime.split('T')[0];
    } else if (dateTime.includes(' ')) {
      datePart = dateTime.split(' ')[0];
    } else {
      datePart = dateTime;
    }
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  }

  extractTimeOnly(dataISO: string): string {
    if (!dataISO || !dataISO.includes('T')) {
      console.error('Data inválida:', dataISO);
      return '';
    }
    const horario = dataISO.split('T')[1]?.split('.')[0];
    return horario || '';
  }

  filtrar() {
    if (this.dataInicial && this.dataFinal) {
      const dataInicialISO = new Date(this.dataInicial).toISOString().split('T')[0];
      const dataFinalISO = new Date(this.dataFinal).toISOString().split('T')[0];

      this.filteredNoticias = this.noticias.filter((noticia) => {
        const dataPublicacaoISO = new Date(noticia.dataPublicacao).toISOString().split('T')[0];
        return dataPublicacaoISO >= dataInicialISO && dataPublicacaoISO <= dataFinalISO;
      });
    } else {
      this.filteredNoticias = this.noticias;
    }
  }

  limparFiltros() {
    this.dataFinal = undefined;
    this.dataInicial = undefined;
    this.campoPesquisa = '';
    this.filteredNoticias = this.noticias;
  }
}
