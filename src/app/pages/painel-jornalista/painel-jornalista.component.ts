import { Component } from '@angular/core';
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

@Component({
  selector: 'app-painel-jornalista',
  standalone: true,
  imports: [DataViewModule, DataViewComponent, ImageModule, CommonModule, ToolbarModule, ButtonModule, ToastModule],
  providers: [DialogService, DynamicDialogRef, AlertService, DynamicDialogConfig, MessageService],
  templateUrl: './painel-jornalista.component.html',
  styleUrl: './painel-jornalista.component.scss',
})
export class PainelJornalistaComponent {
  noticias: Noticia[] = [];

  constructor(private apiService: ApiService, private userService: UsuarioService, private dialogService: DialogService, private alertService: AlertService, private messageService: MessageService) {
    this.init();
  }

  async init() {
    //@ts-ignore
    this.noticias = await this.apiService.makeGetRequest(`noticias?size=99999`);
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

    caixaDeDialogo.onClose.subscribe(async (noticia: Noticia) => {
      if (noticia) {
        // @ts-ignore
        let noticiaSaved: any = noticia.id ? await this.apiService.makePutRequest('noticias/' + noticia.id, noticia) : await this.apiService.makePostRequest('noticias', noticia);

        if (!noticiaSaved) {
          this.criarNoticia(noticia);
        } else {
          if (noticia.id) {
            this.noticias = this.noticias.map((value: Noticia) => {
              return value.id == noticia.id ? noticia : value;
            });
            this.messageService.add({ severity: 'success', summary: 'Notícia editada com sucesso!', detail: 'InfoPulse', icon: 'pi-check', key: 'tl', life: 3000 });
          } else {
            this.noticias = [...this.noticias, noticiaSaved];
            this.messageService.add({ severity: 'success', summary: 'Notícia criada com sucesso!', detail: 'InfoPulse', icon: 'pi-check', key: 'tl', life: 3000 });
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
}
