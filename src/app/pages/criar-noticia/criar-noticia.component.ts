import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import Noticia from 'src/app/classes/noticia';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import { ApiService } from 'src/app/services/api.service';
import { FormsModule } from '@angular/forms';
import { FirebaseStorageService } from 'src/app/services/firebase-storage.service';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-criar-noticia',
  standalone: true,
  imports: [DropdownModule, CommonModule, FormsModule, ButtonModule, InputTextareaModule],
  templateUrl: './criar-noticia.component.html',
  styleUrl: './criar-noticia.component.scss'
})
export class CriarNoticiaComponent {

  selectedFile: File | null = null;
  uploadProgress: number | null = null;
  downloadURL: string | null = null;
  error: string | null = null;

  noticia: Noticia
  statusOptions = []
  categorias: any

  constructor(public config: DynamicDialogConfig, public ref: DynamicDialogRef, private dialogService: DialogService, private apiService: ApiService, private fireBaseStorage: FirebaseStorageService) {
    this.noticia = this.config.data.noticia;
  }

  async init() {
    
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadFile(): void {
    if (this.selectedFile) {
      this.fireBaseStorage.uploadFile(this.selectedFile).subscribe({
        next: (url: string) => {
          this.downloadURL = url;
          this.uploadProgress = null; // Reset progress after successful upload
        },
        error: (err) => {
          this.error = `Upload failed: ${err.message}`;
          this.uploadProgress = null; // Reset progress on error
        },
        complete: () => {
          console.log('Upload complete');
        },
      });
    } else {
      this.error = 'No file selected';
    }
  }

  cancelar() {

  }

  salvar() {

  }

}
