import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import Noticia from 'src/app/classes/noticia';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormsModule, Validators } from '@angular/forms';
import { FirebaseStorageService } from 'src/app/services/firebase-storage.service';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import Categoria from 'src/app/classes/categoria';
import { AlertService } from 'src/app/services/alert.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import PalavraChave from 'src/app/classes/palavraChave';
import { PickListModule } from 'primeng/picklist';

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
    CheckboxModule,
    PickListModule,
  ],
  templateUrl: './criar-noticia.component.html',
  styleUrl: './criar-noticia.component.scss',
  providers: [MessageService, AlertService],
})
export class CriarNoticiaComponent {
  noticiaForm!: FormGroup;
  palavrasForm!: FormGroup;
  selectedFile: File | any = null;
  categorias: Categoria[] = [];
  uploadProgress: number | null = null;
  downloadURL: string | null | undefined = null;
  error: string | null = null;
  loading: boolean = false;
  novaImagemSelecionada: boolean = false;
  palavras: any[] = [];
  palavrasChave: PalavraChave[] = [];
  palavrasChaveAntes: PalavraChave[] = [];

  noticia: Noticia | undefined;
  statusOptions = [
    { nome: 'ATIVO', value: true },
    { nome: 'INATIVO', value: false },
  ];

  ImagemCarregada: any = {
    nome: null,
    url: null,
    tamanho: null,
  };

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private apiService: ApiService,
    private fireBaseStorage: FirebaseStorageService,
    private messageService: MessageService,
    private alertService: AlertService,
    private usuarioService: UsuarioService
  ) {
    this.init();
  }

  async init() {
 
    const now = new Date();
    const timeZoneOffset = -3;

    const dataPublicacao = new Date(now.getTime() + timeZoneOffset * 60 * 60 * 1000);
    const dataUltimaModificacao = new Date(now.getTime() + timeZoneOffset * 60 * 60 * 1000);

    this.noticiaForm = new FormGroup({
      id: new FormControl(null),
      titulo: new FormControl('', [Validators.required, Validators.minLength(5)]),
      conteudo: new FormControl('', [Validators.required, Validators.minLength(10)]),
      resumo: new FormControl('', [Validators.required, Validators.minLength(10)]),
      ativo: new FormControl('', Validators.required),
      categoria: new FormControl(null, Validators.required),
      autor: new FormControl('asdsad', Validators.required),
      dataPublicacao: new FormControl(dataPublicacao, Validators.required),
      dataUltimaModificacao: new FormControl(dataUltimaModificacao, Validators.required),
      imagemContentType: new FormControl(),
    });

    this.noticiaForm.get('resumo')?.valueChanges.subscribe((resumo) => {
      this.palavras = this.extrairPalavras(resumo);
    });

    if (this.config.data.noticiaForm) {
      this.noticiaForm.patchValue(this.config.data.noticiaForm);

      if (this.noticiaForm.get('id')?.value !== null) {
        this.apiService.makeGetRequest<PalavraChave[]>(`palavras-chaves?size=99999&noticiaId.equals=${this.noticiaForm.get('id')?.value}`).subscribe({
          next: (response: PalavraChave[]) => {
            this.palavrasChave = response;
            this.palavras = this.palavras.filter((palavra) => {
              return !this.palavrasChave.some((palavraChave) => palavraChave.palavra === palavra.palavra);
            });
            if (this.palavrasChaveAntes.length === 0) {
              this.palavrasChaveAntes = [...this.palavrasChave];
            }
          },
        });
      }

      this.ImagemCarregada.url = this.noticiaForm.get('imagemContentType')?.value;

      if (this.ImagemCarregada.url) {
        this.downloadURL = this.ImagemCarregada.url;
        const metadados = await this.fireBaseStorage.obterMetadadosDaImagem(this.ImagemCarregada.url);

        if (metadados?.nome) {
          this.ImagemCarregada.nome = metadados?.nome;
          this.ImagemCarregada.tamanho = metadados?.tamanho;
        } else {
          this.ImagemCarregada.nome = 'Imagem Carregada';
          this.ImagemCarregada.tamanho = metadados?.tamanho;
        }
      }
    }

    this.apiService.makeGetRequest('categorias?size=99999').subscribe({
      next: (response: any) => {
        this.categorias = response;
      },
      complete: () => {
        if (this.noticiaForm.get('id')?.value) {
          let categoria = this.noticiaForm.get('categoria')?.value;

          let categoriaEncontrada = this.categorias.find((val) => {
            return val.id == categoria.id;
          });

          this.noticiaForm.patchValue({
            categoria: categoriaEncontrada,
          });
        }
      },
    });
  }

  extrairPalavras(resumo: string): PalavraChave[] {
    return Array.from(
      new Set(
        resumo
          .split(' ')
          .map((palavra) => palavra.trim().replace(/[.,;!?:]+/g, ''))
          .filter((palavra) => palavra.length > 0)
      )
    ).map((palavra) => {
      return { palavra } as PalavraChave;
    });
  }

  sanitizeFilename(filename: string): string {
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  }

  async onUpload(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.selectedFile) {
        this.fireBaseStorage.uploadFile(this.selectedFile).subscribe({
          next: (url: string) => {
            this.downloadURL = url;
            this.novaImagemSelecionada = true;
            this.uploadProgress = null;
          },
          error: (err) => {
            this.error = `Upload failed: ${err.message}`;
            this.uploadProgress = null;
            this.novaImagemSelecionada = false;
            reject(err);
          },
          complete: () => {
            this.novaImagemSelecionada = true;
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

  removerImagemAntesDeSalvarOFormulario() {
    this.selectedFile = null;
    this.noticiaForm.patchValue({
      imagemContentType: '',
    });
    this.ImagemCarregada.url = null;
    this.downloadURL = null;
    this.novaImagemSelecionada = true;
  }

  selecionarImagem(event: any) {
    this.selectedFile = event.files[0];
    const sanitizedFilename = this.sanitizeFilename(this.selectedFile.name);
    this.selectedFile = new File([this.selectedFile], sanitizedFilename, { type: this.selectedFile.type });

    this.ImagemCarregada.url = null;
    this.downloadURL = null;
    this.novaImagemSelecionada = true;
  }

  cancelar() {
    this.ref.close(false);
  }

  arraysTemPalavrasIguais(arr1: any[], arr2: any[]) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    const palavrasSet = new Set(arr2.map((obj) => obj.palavra));
    return arr1.every((obj) => palavrasSet.has(obj.palavra));
  }

  async salvar() {
    if (this.noticiaForm.invalid) {
      this.alertService.exibirErroOuAlerta('Erro', 'Preencha todos os campos obrigatórios antes de continuar.', '50%');
      return;
    }

    const now = new Date();
    const timeZoneOffset = -3;

    this.noticiaForm.patchValue({
      dataUltimaModificacao: new Date(now.getTime() + timeZoneOffset * 60 * 60 * 1000),
    });

    const palavrasChaveUnicas = Array.from(new Set(this.palavrasChave.map((p) => p.palavra))).map((palavra) => ({ palavra }));

    if (this.noticiaForm.get('id')?.value) {
      if (!this.ImagemCarregada.url && !this.downloadURL && !this.selectedFile) {
        this.alertService.exibirErroOuAlerta('Erro', 'Você deve selecionar uma imagem para a notícia antes de continuar.', '50%');
        return;
      }

      if (this.novaImagemSelecionada) {
        this.loading = true;
        await this.onUpload();
        this.noticiaForm.patchValue({
          imagemContentType: this.downloadURL,
        });
        this.loading = false;
      }

      if (this.noticiaForm.valid) {
        this.loading = true;

        this.ref.close({ noticiaForm: this.noticiaForm.value, palavrasChavesUnicas: palavrasChaveUnicas, palavrasChaveAntes: this.palavrasChaveAntes });

        this.loading = false;
      }
    } else {
      if (!this.selectedFile) {
        this.alertService.exibirErroOuAlerta('Erro', 'Você deve selecionar uma imagem para a notícia antes de continuar.', '50%');
        return;
      } else {
        this.loading = true;
        await this.onUpload();
        this.noticiaForm.patchValue({
          imagemContentType: this.downloadURL,
        });

        if (this.noticiaForm.valid) {
          this.ref.close({ noticiaForm: this.noticiaForm.value, palavrasChavesUnicas: palavrasChaveUnicas, palavrasChaveAntes: this.palavrasChaveAntes });
        }
        this.loading = false;
      }
    }
  }
}
