import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import Categoria from 'src/app/classes/categoria';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listar-categorias',
  standalone: true,
  imports: [TableModule, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './listar-categorias.component.html',
  styleUrl: './listar-categorias.component.scss',
})
export class ListarCategoriasComponent {
  loadingData: boolean = true;
  categorias: Categoria[] = [];
  filteredCategorias: Categoria[] = [];
  campoPesquisa: string = '';

  constructor() {}

  async init() {}

  toUpper(texto: string) {
    return texto?.toUpperCase();
  }

  changeItemsMenu() {}

  async criarCategoria(item: any) {}

  async excluirItem(item: any) {}

  onFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value.toLowerCase() || '';

    this.campoPesquisa = value;

    // Filtrar as notícias localmente pelo título, por exemplo
    this.filteredCategorias = this.categorias.filter((categoria) =>
      //@ts-ignore
      categoria.nome.toLowerCase().includes(value)
    );
  }
}
