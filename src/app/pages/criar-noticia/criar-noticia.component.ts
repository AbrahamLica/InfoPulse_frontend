import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import Noticia from 'src/app/classes/noticia';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormsModule, MinLengthValidator, Validators } from '@angular/forms';
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
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';

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
    ReactiveFormsModule,
  ],
  templateUrl: './criar-noticia.component.html',
  styleUrl: './criar-noticia.component.scss',
  providers: [MessageService, AlertService],
})
export class CriarNoticiaComponent {
  noticiaForm!: FormGroup;
  selectedFile: File | any = null;
  categorias: Categoria[] = [];
  uploadProgress: number | null = null;
  downloadURL: string | null | undefined = null;
  error: string | null = null;
  loading: boolean = false;

  noticia: Noticia | undefined;
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
    this.init();
  }

  async init() {
    let primeiroNome: any = this.usuarioService?.dadosUsuario?.user?.firstName;
    let ultimoNome: any = this.usuarioService?.dadosUsuario?.user?.lastName;

    this.noticiaForm = new FormGroup({
      id: new FormControl(null),
      titulo: new FormControl('', [Validators.required, Validators.minLength(5)]),
      conteudo: new FormControl('', [Validators.required, Validators.minLength(10)]),
      resumo: new FormControl('', [Validators.required, Validators.minLength(10)]),
      ativo: new FormControl('', Validators.required),
      categoria: new FormControl(null, Validators.required),
      autor: new FormControl(`${primeiroNome} ${ultimoNome}`, Validators.required),
      dataPublicacao: new FormControl(new Date(), Validators.required),
      imagemContentType: new FormControl(),
    });

    if (this.config.data.noticia) {
      this.noticiaForm.patchValue(this.config.data.noticia);

      if (this.noticiaForm.get('imagemContentType')?.value) {
        this.selectedFile = {
          name: 'Imagem Carregada',
          size: null,
          url: this.noticiaForm.get('imagemContentType')?.value,
        } as any;
      }
    }

    //@ts-ignore
    this.categorias = await this.apiService.makeGetRequest('categorias?size=99999');

    //carregar manualmente a categoria do objeto salvo anteriormente
    if (this.noticiaForm.get('id')?.value) {
      let categoria = this.noticiaForm.get('categoria')?.value;

      let categoriaEncontrada = this.categorias.find((val) => {
        //@ts-ignore
        return val.id == categoria.id;
      });

      this.noticiaForm.patchValue({
        categoria: categoriaEncontrada,
      });
    }

    console.log(this.noticiaForm.value);
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
    if (!this.selectedFile && this.noticiaForm.valid) {
      this.alertService.exibirErroOuAlerta('Erro', 'Você deve selecionar uma imagem para a notícia antes de continuar.');
      return;
    }

    if (this.noticiaForm.valid) {
      this.loading = true;
      await this.onUpload();
      this.noticiaForm.patchValue({
        imagemContentType: this.downloadURL,
      });
      this.loading = false;
      this.ref.close(this.noticiaForm.value);
    }
  }
}
