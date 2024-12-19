import { Injectable } from '@angular/core';
import Noticia from '../classes/noticia';

@Injectable({
  providedIn: 'root', // Singleton Service
})
export class NoticiaService {
  private noticiasExternas: Noticia[] = [];
  private noticiasInternas: Noticia[] = [];
  private palavrasChaveMap: Map<number, any[]> = new Map();

  setNoticiasExternas(noticias: Noticia[]): void {
    this.noticiasExternas = noticias;
  }

  getNoticiasExternas(): Noticia[] {
    return this.noticiasExternas;
  }

  setNoticiasInternas(noticias: Noticia[]): void {
    this.noticiasInternas = noticias;
  }

  getNoticiasInternas(): Noticia[] {
    return this.noticiasInternas;
  }

  setPalavrasChaveMap(map: Map<number, any[]>): void {
    this.palavrasChaveMap = map;
  }

  getPalavrasChaveMap(): Map<number, any[]> {
    return this.palavrasChaveMap;
  }
}
