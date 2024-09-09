import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TopBarComponent } from '../../util/top-bar/top-bar.component';
import { DataViewModule } from 'primeng/dataview';
import { DataViewComponent } from '../../util/data-view/data-view.component';
import { TagModule } from 'primeng/tag';
import { FirebaseStorageService } from 'src/app/services/firebase-storage.service';
import { Noticia } from 'src/app/classes/noticia';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    TopBarComponent,
    DataViewModule,
    DataViewComponent,
    TagModule,
    ImageModule
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  selectedFile: File | null = null;
  uploadProgress: number | null = null;
  downloadURL: string | null = null;
  error: string | null = null;
  noticias: Noticia[] = [];

  constructor(
    private apiService: ApiService,
    private userService: UsuarioService,
    private fireBaseStorage: FirebaseStorageService
  ) {
    this.init();
  }

  async init() {
    //@ts-ignore
    this.noticias = await this.apiService.makeGetRequest(`noticias?size=99999`);

    console.log(this.noticias);
  }

  logout() {
    this.userService.deslogar();
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
}
