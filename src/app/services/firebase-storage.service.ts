import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL, getMetadata, getStorage } from '@angular/fire/storage';
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

  async obterMetadadosDaImagem(url: string) {
    try {
      // Decodificar a URL para remover codificações duplas
      const decodedUrl = decodeURIComponent(url);

      // Expressão regular para extrair o caminho do arquivo
      const regex = /\/o\/(.*?)\?/;
      const match = decodedUrl.match(regex);

      if (match && match[1]) {
        const fullPath = match[1]; // Exemplo: 'images/Recorte_de_jornal_Diário_Carioca_1960_greve_da_paridade.png'

        // Criar referência usando o caminho completo decodificado
        const storageRef = ref(this.storage, fullPath);

        // Obter metadados do arquivo
        const metadata = await getMetadata(storageRef);

        return {
          nome: metadata.name,
          tamanho: metadata.size,
        };
      } else {
        console.error('Não foi possível extrair o caminho do arquivo da URL.');
        return null;
      }
    } catch (error) {
      console.error('Erro ao obter metadados:', error);
      return null;
    }
  }
}
