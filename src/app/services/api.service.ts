import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UsuarioService } from './usuario.service';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DialogService } from 'primeng/dynamicdialog';
import { AlertModalComponent } from '../util/alert-modal/alert-modal.component';
import _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  environment = {
    production: false,
    urlBackend: 'http://localhost:8080/api',
    urlFilesBackend: 'http://localhost:8080',
  };

  constructor(
    private http: HttpClient,
    private usuarioService: UsuarioService,
    private router: Router,
    private dialogService: DialogService
  ) {}

  private createHeaders(anonimo?: boolean): HttpHeaders {
    let headers = new HttpHeaders();

    if (!anonimo && this.usuarioService?.dadosUsuario?.id_token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.usuarioService.dadosUsuario.id_token}`
      );
    }

    return headers;
  }

  private handleError(e: any) {
    if (e.status === 401) {
      this.router.navigateByUrl('/login');
      return throwError(() => e);
    }

    const errorTitle = e.error?.title || 'Erro desconhecido';
    const errorDetails = e.error?.detail || 'Erro desconhecido';

    if (e.status === 500 && e.error.path == '/api/usuarios') {
      console.log('deu erro de usuario, mas tudo bem!');
    } else {
      this.dialogService.open(AlertModalComponent, {
        header: 'Erro',
        width: '50%',
        data: { content: errorDetails },
      });
    }

    return throwError(() => e);
  }

  makeGetRequestApi(rest: string, anonimo?: boolean) {
    const headers = this.createHeaders(anonimo);

    return this.http
      .get(`${rest}`, { headers })
      .pipe(catchError((e) => this.handleError(e)));
  }

  makeGetRequest<T>(rest: string, anonimo?: boolean): Observable<T> {
    const headers = this.createHeaders(anonimo);

    return this.http
      .get<T>(`${this.environment.urlBackend}/${rest}`, { headers })
      .pipe(catchError((e) => this.handleError(e)));
  }

  makePostRequest(rest: string, body: any) {
    const headers = this.createHeaders();

    return this.http
      .post(`${this.environment.urlBackend}/${rest}`, body, { headers })
      .pipe(catchError((e) => this.handleError(e)));
  }

  makePutRequest(rest: string, body: any) {
    const headers = this.createHeaders();

    return this.http
      .put(`${this.environment.urlBackend}/${rest}`, body, { headers })
      .pipe(catchError((e) => this.handleError(e)));
  }

  makePatchRequest(rest: string, body: any) {
    const headers = this.createHeaders();

    return this.http
      .patch(`${this.environment.urlBackend}/${rest}`, body, { headers })
      .pipe(catchError((e) => this.handleError(e)));
  }

  makeDeleteRequest(rest: string) {
    const headers = this.createHeaders();

    return this.http
      .delete(`${this.environment.urlBackend}/${rest}`, { headers })
      .pipe(catchError((e) => this.handleError(e)));
  }
}
