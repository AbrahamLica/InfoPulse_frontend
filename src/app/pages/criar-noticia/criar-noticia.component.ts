import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import Noticia from 'src/app/classes/noticia';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService } from 'src/app/services/api.service';
import { FormsModule } from '@angular/forms';
import { FirebaseStorageService } from 'src/app/services/firebase-storage.service';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { FileUploadModule, UploadEvent } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import Categoria from 'src/app/classes/categoria';
import { AlertService } from 'src/app/services/alert.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-criar-noticia',
  standalone: true,
  imports: [
    DropdownModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextareaModule,
    InputTextModule,
    FileUploadModule,
    ToastModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './criar-noticia.component.html',
  styleUrl: './criar-noticia.component.scss',
  providers: [MessageService, AlertService],
})
export class CriarNoticiaComponent {
  selectedFile: File | null = null;
  categorias: Categoria[] = [];
  uploadProgress: number | null = null;
  downloadURL: string | null | undefined = null;
  error: string | null = null;
  loading: boolean = false;

  noticia: Noticia;
  statusOptions = [
    { nome: 'ATIVO', value: true },
    { nome: 'INATIVO', value: false },
  ];

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private dialogService: DialogService,
    private apiService: ApiService,
    private fireBaseStorage: FirebaseStorageService,
    private messageService: MessageService,
    private alertService: AlertService,
    private usuarioService: UsuarioService
  ) {
    this.noticia = this.config.data.noticia;
    this.init();
  }

  async init() {
    //@ts-ignore
    this.categorias = await this.apiService.makeGetRequest('categorias?size=99999');

    this.noticia.dataPublicacao = new Date();

    console.log(this.noticia.dataPublicacao);
  }

  async onUpload(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.selectedFile) {
        this.fireBaseStorage.uploadFile(this.selectedFile).subscribe({
          next: (url: string) => {
            this.downloadURL = url;
            this.uploadProgress = null;
          },
          error: (err) => {
            this.error = `Upload failed: ${err.message}`;
            this.uploadProgress = null;
            reject(err);
          },
          complete: () => {
            console.log('Upload complete');
            this.noticia.imagemContentType = this.downloadURL;
            this.messageService.add({
              severity: 'info',
              summary: 'File Uploaded',
              detail: 'Arquivo carregado com sucesso!',
            });
            resolve();
          },
        });
      } else {
        this.error = 'No file selected';
        reject(new Error('No file selected'));
      }
    });
  }

  selecionarImagem(event: any) {
    this.selectedFile = event.files[0];
  }

  cancelar() {
    this.ref.close(false);
  }

  async salvar() {
    let formValido = true;

    if (!this.noticia.titulo) {
      this.alertService.exibirErroOuAlerta('Erro', "O campo 'Título' não pode ser vazio");
      formValido = false;
    }

    if (!this.noticia.conteudo) {
      this.alertService.exibirErroOuAlerta('Erro', "O campo 'Conteúdo' não pode ser vazio");
      formValido = false;
    }

    if (!this.noticia.resumo) {
      this.alertService.exibirErroOuAlerta('Erro', "O campo 'Resumo' não pode ser vazio");
      formValido = false;
    }

    if (this.noticia.ativo == null) {
      this.alertService.exibirErroOuAlerta('Erro', "O campo 'Status' não pode ser vazio");
      formValido = false;
    }

    if (!this.noticia.categoria) {
      this.alertService.exibirErroOuAlerta('Erro', "O campo 'Categoria' não pode ser vazio");
      formValido = false;
    }

    if (!this.selectedFile) {
      this.alertService.exibirErroOuAlerta('Erro', 'Você deve selecionar uma imagem para a notícia antes de continuar.');
      formValido = false;
    }

    if (formValido) {
      this.loading = true;
      await this.onUpload();
      let primeiroNome: any = this.usuarioService?.dadosUsuario?.user?.firstName;
      let ultimoNome: any = this.usuarioService?.dadosUsuario?.user?.lastName;
      this.noticia.autor = `${primeiroNome} ${ultimoNome}`;
      this.noticia.dataPublicacao = new Date();
      this.loading = false;
      this.ref.close(this.noticia);
    }
  }
}
