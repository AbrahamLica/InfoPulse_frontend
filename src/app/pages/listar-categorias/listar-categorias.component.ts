import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import Categoria from 'src/app/classes/categoria';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { CriarCategoriaComponent } from '../criar-categoria/criar-categoria.component';
import { ConfirmModalComponent } from 'src/app/util/confirm-modal/confirm-modal.component';
import { ToastModule } from 'primeng/toast';
import { AlertModalComponent } from 'src/app/util/alert-modal/alert-modal.component';

@Component({
  selector: 'app-listar-categorias',
  standalone: true,
  imports: [TableModule, ButtonModule, InputTextModule, FormsModule, ToastModule],
  providers: [DialogService, DynamicDialogRef, AlertService, DynamicDialogConfig, MessageService],
  templateUrl: './listar-categorias.component.html',
  styleUrl: './listar-categorias.component.scss',
})
export class ListarCategoriasComponent {
  loadingData: boolean = false;
  categorias: Categoria[] = [];
  filteredCategorias: Categoria[] = [];
  campoPesquisa: string = '';

  constructor(private apiService: ApiService, private userService: UsuarioService, private dialogService: DialogService, private alertService: AlertService, private messageService: MessageService) {
    this.init();
  }

  async init() {
    const response = await this.apiService.makeGetRequest(`categorias?size=99999`);
    this.categorias = Array.isArray(response) ? response : [];
    this.filteredCategorias = this.categorias;
  }

  toUpper(texto: string) {
    return texto?.toUpperCase();
  }

  async criarCategoria(categoria?: Categoria) {
    let caixaDeDialogo = this.dialogService.open(CriarCategoriaComponent, {
      header: categoria ? (categoria.id ? 'Editar' : 'Cadastrar') : 'Cadastrar',
      width: '40%',
      data: {
        categoria: categoria || new Categoria(),
      },
    });

    caixaDeDialogo.onClose.subscribe(async (categoriaEditada: Categoria) => {
      if (categoriaEditada) {
        let categoriaSaved: any;

        // Verifica se é uma edição (noticia.id) ou uma criação de nova notícia
        if (categoriaEditada.id) {
          // Se for edição, realiza a requisição PUT
          categoriaSaved = await this.apiService.makePutRequest('categorias/' + categoriaEditada.id, categoriaEditada);

          // Se a notícia foi editada com sucesso
          if (categoriaSaved) {
            // Atualiza o array de notícias local substituindo a notícia editada
            this.categorias = this.categorias.map((categoria) => (categoria.id === categoriaSaved.id ? categoriaSaved : categoria));

            // Atualiza também o array de notícias filtradas, para manter consistência após pesquisa
            this.filteredCategorias = this.filteredCategorias.map((categoria) => (categoria.id === categoriaSaved.id ? categoriaSaved : categoria));

            this.messageService.add({
              severity: 'success',
              summary: 'Notícia editada com sucesso!',
              icon: 'pi-check',
              key: 'tl',
              life: 3000,
            });
          }
        } else {
          categoriaSaved = await this.apiService.makePostRequest('categorias', categoriaEditada);

          if (categoriaSaved) {
            this.categorias = [...this.categorias, categoriaSaved];
            this.filteredCategorias = [...this.filteredCategorias, categoriaSaved];

            this.messageService.add({
              severity: 'success',
              summary: 'Notícia criada com sucesso!',
              icon: 'pi-check',
              key: 'tl',
              life: 3000,
            });
          }
        }
      }
    });
  }

  async excluirItem(item: any) {
    let ref = this.dialogService.open(ConfirmModalComponent, {
      header: 'Excluir',
      width: '50%',
      data: { content: 'Deseja excluir a noticia selecionada?' },
    });

    ref.onClose.subscribe(async (resposta: boolean) => {
      if (resposta) {
        await this.apiService.makeDeleteRequest(`categorias/${item.id}`);
        this.categorias = this.categorias.filter((value) => value.id != item.id);
        this.filteredCategorias = this.filteredCategorias.filter((value) => value.id != item.id);
        this.messageService.add({ severity: 'success', summary: 'Notícia excluída com sucesso!', icon: 'pi-check', key: 'tc', life: 3000 });
      }
    });
  }

  onFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value.toLowerCase() || '';

    this.campoPesquisa = value;

    this.filteredCategorias = this.categorias.filter((categoria) =>
      //@ts-ignore
      categoria.nome.toLowerCase().includes(value)
    );
  }
}
