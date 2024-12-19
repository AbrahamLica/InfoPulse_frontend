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
    this.apiService.makeGetRequest<Categoria[]>(`categorias?size=99999`).subscribe({
      next: (response: Categoria[]) => {
        this.categorias = response;
        this.filteredCategorias = this.categorias;
      },
      error: (e) => {
        console.log(e);
      },
      complete() {},
    });
  }

  toUpper(texto: string) {
    return texto?.toUpperCase();
  }

  criarCategoria(categoria?: Categoria) {
    const caixaDeDialogo = this.dialogService.open(CriarCategoriaComponent, {
      header: categoria ? (categoria.id ? 'Editar' : 'Cadastrar') : 'Cadastrar',
      width: '40%',
      data: {
        categoria: categoria || new Categoria(),
      },
    });

    caixaDeDialogo.onClose.subscribe((categoriaEditada: Categoria) => {
      if (categoriaEditada) {
        if (categoriaEditada.id) {
          this.apiService.makePutRequest('categorias/' + categoriaEditada.id, categoriaEditada).subscribe({
            next: (categoriaSaved: Categoria) => {
              this.categorias = this.categorias.map((categoria) => (categoria.id === categoriaSaved.id ? categoriaSaved : categoria));
              this.filteredCategorias = this.filteredCategorias.map((categoria) => (categoria.id === categoriaSaved.id ? categoriaSaved : categoria));

              this.messageService.add({
                severity: 'success',
                summary: 'Categoria editada com sucesso!',
                icon: 'pi-check',
                key: 'tl',
                life: 3000,
              });
            },
            error: (err) => {
              console.error('Erro ao editar categoria:', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Erro ao editar categoria',
                detail: 'Ocorreu um erro ao tentar editar a categoria.',
                icon: 'pi-times',
                key: 'tl',
                life: 3000,
              });
            },
          });
        } else {
          this.apiService.makePostRequest('categorias', categoriaEditada).subscribe({
            next: (categoriaSaved: Categoria) => {
              this.categorias = [...this.categorias, categoriaSaved];
              this.filteredCategorias = [...this.filteredCategorias, categoriaSaved];

              this.messageService.add({
                severity: 'success',
                summary: 'Categoria criada com sucesso!',
                icon: 'pi-check',
                key: 'tl',
                life: 3000,
              });
            },
            error: (err) => {
              console.error('Erro ao criar categoria:', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Erro ao criar categoria',
                detail: 'Ocorreu um erro ao tentar criar a categoria.',
                icon: 'pi-times',
                key: 'tl',
                life: 3000,
              });
            },
          });
        }
      }
    });
  }

  async excluirItem(item: any) {
    let ref = this.dialogService.open(ConfirmModalComponent, {
      header: 'Excluir',
      width: '50%',
      data: { content: 'Deseja excluir a categoria selecionada?' },
    });

    ref.onClose.subscribe(async (resposta: boolean) => {
      if (resposta) {
        this.apiService.makeDeleteRequest(`categorias/${item.id}`).subscribe({
          next: () => {
            this.categorias = this.categorias.filter((value) => value.id != item.id);
            this.filteredCategorias = this.filteredCategorias.filter((value) => value.id != item.id);
            this.messageService.add({ severity: 'success', summary: 'Categoria excluída com sucesso!', icon: 'pi-check', key: 'tc', life: 3000 });
          },
        });
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
