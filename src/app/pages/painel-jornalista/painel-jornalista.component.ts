import { Component } from '@angular/core';
import { DataViewModule } from 'primeng/dataview';
import { DataViewComponent } from '../../util/data-view/data-view.component';
import { ImageModule } from 'primeng/image';
import Noticia  from 'src/app/classes/noticia';
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { CriarNoticiaComponent } from '../criar-noticia/criar-noticia.component';

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
  ],
  providers: [DialogService],
  templateUrl: './painel-jornalista.component.html',
  styleUrl: './painel-jornalista.component.scss',
})
export class PainelJornalistaComponent {
  noticias: Noticia[] = [];

  constructor(
    private apiService: ApiService,
    private userService: UsuarioService,
    private dialogService: DialogService
  ) {
    this.init();
  }

  async init() {
    //@ts-ignore
    this.noticias = await this.apiService.makeGetRequest(`noticias?size=99999`);

    console.log(this.noticias);
  }

  editarNoticia() {}

  excluirNoticia() {}

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
        let noticiaSaved: any = noticia.id
          ? await this.apiService.makePutRequest(
              'noticias/' + noticia.id,
              noticia
            )
          : await this.apiService.makePostRequest('noticias', noticia);

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
