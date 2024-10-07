import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import Noticia from 'src/app/classes/noticia';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
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

@Component({
  selector: 'app-criar-noticia',
  standalone: true,
  imports: [DropdownModule, CommonModule, FormsModule, ButtonModule, InputTextareaModule, InputTextModule, FileUploadModule, ToastModule, ProgressSpinnerModule, ReactiveFormsModule],
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
  novaImagemSelecionada: boolean = false;

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

    const now = new Date();
    const timeZoneOffset = -3; // Fuso horário de Brasília e Belém do Pará (GMT-3)

    const dataPublicacao = new Date(now.getTime() + timeZoneOffset * 60 * 60 * 1000);
    const dataUltimaModificacao = new Date(now.getTime() + timeZoneOffset * 60 * 60 * 1000);

    this.noticiaForm = new FormGroup({
      id: new FormControl(null),
      titulo: new FormControl('', [Validators.required, Validators.minLength(5)]),
      conteudo: new FormControl('', [Validators.required, Validators.minLength(10)]),
      resumo: new FormControl('', [Validators.required, Validators.minLength(10)]),
      ativo: new FormControl('', Validators.required),
      categoria: new FormControl(null, Validators.required),
      autor: new FormControl(`${primeiroNome} ${ultimoNome}`, Validators.required),
      dataPublicacao: new FormControl(dataPublicacao, Validators.required),
      dataUltimaModificacao: new FormControl(dataUltimaModificacao, Validators.required),
      imagemContentType: new FormControl(),
    });

    if (this.config.data.noticia) {
      this.noticiaForm.patchValue(this.config.data.noticia);

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
  }

  sanitizeFilename(filename: string): string {
    return filename
      .normalize('NFD') // Remove diacríticos (acentos)
      .replace(/[\u0300-\u036f]/g, '') // Remove marcas de acentuação
      .replace(/[^a-zA-Z0-9_.-]/g, '_') // Substitui caracteres inválidos por "_"
      .replace(/_{2,}/g, '_') // Substitui múltiplos underscores por um único
      .replace(/^_|_$/g, ''); // Remove underscores do início ou fim
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
            console.log('Upload complete');
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
    this.novaImagemSelecionada = true; // Indica que uma nova imagem será carregada
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

  async salvar() {
    // Primeiro, verificamos se o formulário é válido antes de continuar
    if (this.noticiaForm.invalid) {
      // Se o formulário for inválido, exibe a mensagem de erro e não prossegue com o salvamento
      this.alertService.exibirErroOuAlerta('Erro', 'Preencha todos os campos obrigatórios antes de continuar.', '50%');
      return; // Retorna e não executa mais nada
    }

    const now = new Date();
    const timeZoneOffset = -3;

    this.noticiaForm.patchValue({
      dataUltimaModificacao: new Date(now.getTime() + timeZoneOffset * 60 * 60 * 1000),
    });

    // Se o formulário passou na validação, continuamos
    if (this.noticiaForm.get('id')?.value) {
      // Verificar se uma imagem foi removida ou substituída
      if (!this.ImagemCarregada.url && !this.downloadURL) {
        if (!this.selectedFile) {
          this.alertService.exibirErroOuAlerta('Erro', 'Você deve selecionar uma imagem para a notícia antes de continuar.', '50%');
          return;
        } else {
          this.loading = true;
          await this.onUpload();
          this.noticiaForm.patchValue({
            imagemContentType: this.downloadURL,
          });
          this.loading = false;
        }
      } else {
        // Caso não tenha sido removida, mas a imagem anterior existe
        if (this.novaImagemSelecionada) {
          await this.onUpload(); // Fazer upload da nova imagem
          this.noticiaForm.patchValue({
            imagemContentType: this.downloadURL,
          });
        }
      }

      // Se o formulário ainda é válido após as operações, fecha e salva
      if (this.noticiaForm.valid) {
        this.loading = true; // Exibe o spinner apenas aqui, após a validação
        this.ref.close(this.noticiaForm.value);
        this.loading = false;
      }
    } else {
      // Caso seja uma nova notícia
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
          this.ref.close(this.noticiaForm.value);
        }
        this.loading = false;
      }
    }
  }
}
