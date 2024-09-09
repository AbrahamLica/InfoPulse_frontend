import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { Observable, from } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class FirebaseStorageService {
  constructor(private storage: Storage) {}

  // Função para fazer upload do arquivo
  uploadFile(file: File): Observable<string> {
    const filePath = `images/${file.name}`;
    const fileRef = ref(this.storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    return new Observable((observer) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Observe o progresso do upload (opcional)
        },
        (error) => {
          // Tratar erros
          observer.error(error);
        },
        async () => {
          try {
            // Quando o upload é concluído
            const url = await getDownloadURL(fileRef);
            observer.next(url);
            observer.complete();
          } catch (error) {
            observer.error(error);
          }
        }
      );
    });
  }
}
