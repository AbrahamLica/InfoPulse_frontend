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
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'app-painel-jornalista',
  standalone: true,
  imports: [DataViewModule, DataViewComponent, ImageModule, CommonModule, ToolbarModule, ButtonModule, MessagesModule],
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
        this.messageService.add({ severity: 'success', summary: 'Service Message', detail: 'Via MessageService' });

        if (!noticiaSaved) {
          this.criarNoticia(noticia);
        } else {
          if (noticia.id) {
            this.noticias = this.noticias.map((value: Noticia) => {
              return value.id == noticia.id ? noticia : value;
            });
          } else {
            this.noticias = [...this.noticias, noticiaSaved];
          }
        }
      }
    });
  }
}
