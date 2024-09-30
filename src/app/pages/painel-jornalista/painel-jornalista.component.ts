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

@Component({
  selector: 'app-painel-jornalista',
  standalone: true,
  imports: [DataViewModule, DataViewComponent, ImageModule, CommonModule, ToolbarModule, ButtonModule, ToastModule, IconFieldModule, InputTextModule, InputIconModule, TopBarComponent, CalendarModule, FormsModule],
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

  teste: any;

  constructor(private apiService: ApiService, private userService: UsuarioService, private dialogService: DialogService, private alertService: AlertService, private messageService: MessageService) {
    this.init();
  }

  async init() {
    //@ts-ignore
    this.noticias = await this.apiService.makeGetRequest(`noticias?size=99999`);
    this.filteredNoticias = this.noticias;
  }

  onFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value.toLowerCase() || '';

    this.campoPesquisa = value;

    // Filtrar as notícias localmente pelo título, por exemplo
    this.filteredNoticias = this.noticias.filter((noticia) =>
      //@ts-ignore
      noticia.titulo.toLowerCase().includes(value)
    );
  }

  excluirNoticia(item: any) {
    // Abertura do diálogo de confirmação
    let ref = this.dialogService.open(ConfirmModalComponent, {
      header: 'Excluir',
      width: '50%',
      data: { content: 'Deseja excluir a noticia selecionada?' },
    });

    ref.onClose.subscribe(async (resposta: boolean) => {
      if (resposta) {
        await this.apiService.makeDeleteRequest(`noticias/${item.id}`);
        this.noticias = this.noticias.filter((value) => value.id != item.id);
        this.messageService.add({ severity: 'success', summary: 'Notícia excluída com sucesso!', detail: 'InfoPulse', icon: 'pi-check', key: 'tc', life: 3000 });
      }
    });
  }

  async criarNoticia(noticia?: Noticia) {
    let caixaDeDialogo = this.dialogService.open(CriarNoticiaComponent, {
      header: noticia ? (noticia.id ? 'Editar' : 'Cadastrar') : 'Cadastrar',
      width: '70%',
      data: {
        noticia: noticia || new Noticia(),
      },
    });

    caixaDeDialogo.onClose.subscribe(async (noticiaEditada: Noticia) => {
      if (noticiaEditada) {
        let noticiaSaved: any;

        // Verifica se é uma edição (noticia.id) ou uma criação de nova notícia
        if (noticiaEditada.id) {
          // Se for edição, realiza a requisição PUT
          noticiaSaved = await this.apiService.makePutRequest('noticias/' + noticiaEditada.id, noticiaEditada);

          // Se a notícia foi editada com sucesso
          if (noticiaSaved) {
            // Atualiza o array de notícias local substituindo a notícia editada
            this.noticias = this.noticias.map((noticia) => (noticia.id === noticiaSaved.id ? noticiaSaved : noticia));

            // Atualiza também o array de notícias filtradas, para manter consistência após pesquisa
            this.filteredNoticias = this.filteredNoticias.map((noticia) => (noticia.id === noticiaSaved.id ? noticiaSaved : noticia));

            this.messageService.add({
              severity: 'success',
              summary: 'Notícia editada com sucesso!',
              detail: 'InfoPulse',
              icon: 'pi-check',
              key: 'tl',
              life: 3000,
            });
          }
        } else {
          // Se for uma nova notícia, realiza a requisição POST
          noticiaSaved = await this.apiService.makePostRequest('noticias', noticiaEditada);

          if (noticiaSaved) {
            // Adiciona a nova notícia ao array local
            this.noticias = [...this.noticias, noticiaSaved];
            this.filteredNoticias = [...this.filteredNoticias, noticiaSaved];

            this.messageService.add({
              severity: 'success',
              summary: 'Notícia criada com sucesso!',
              detail: 'InfoPulse',
              icon: 'pi-check',
              key: 'tl',
              life: 3000,
            });
          }
        }
      }
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

  extractTimeOnly(dataISO: string): string {
    const horario = dataISO.split('T')[1].split('.')[0];
    return horario;
  }

  filtrar() {}
}
