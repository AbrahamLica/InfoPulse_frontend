import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UsuarioService } from './usuario.service';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

  constructor(private http: HttpClient, private usuarioService: UsuarioService, private router: Router, private dialogService: DialogService) {}

  // Método GET com Observable
  makeGetRequestApi(rest: string, anonimo?: boolean) {
    let headers = new HttpHeaders();

    if (!anonimo && this.usuarioService?.dadosUsuario?.id_token) {
      headers = headers.set('Authorization', `Bearer ${this.usuarioService.dadosUsuario.id_token}`);
    }

    return this.http.get(`${rest}`, { headers }).pipe(
      catchError((e) => this.handleHttpError(e)) // Tratamento de erro com catchError
    );
  }

  // Método GET com Observable
  makeGetRequest<T>(rest: string, anonimo?: boolean): Observable<T> {
    let headers = new HttpHeaders();

    if (!anonimo && this.usuarioService?.dadosUsuario?.id_token) {
      headers = headers.set('Authorization', `Bearer ${this.usuarioService.dadosUsuario.id_token}`);
    }

    return this.http.get<T>(`${this.environment.urlBackend}/${rest}`, { headers }).pipe(
      catchError((e) => this.handleHttpError<T>(e)) // Passa o tipo correto para tratar o erro
    );
  }

  // Método POST com Observable
  makePostRequest(rest: string, body: any) {
    let headers = new HttpHeaders();

    if (this.usuarioService?.dadosUsuario?.id_token) {
      headers = headers.set('Authorization', `Bearer ${this.usuarioService.dadosUsuario.id_token}`);
    }

    return this.http.post(`${this.environment.urlBackend}/${rest}`, body, { headers }).pipe(catchError((e) => this.handleHttpError(e)));
  }

  // Método PUT com Observable
  makePutRequest(rest: string, body: any) {
    let headers = new HttpHeaders();

    if (this.usuarioService?.dadosUsuario?.id_token) {
      headers = headers.set('Authorization', `Bearer ${this.usuarioService.dadosUsuario.id_token}`);
    }

    return this.http.put(`${this.environment.urlBackend}/${rest}`, body, { headers }).pipe(catchError((e) => this.handleHttpError(e)));
  }

  // Método PATCH com Observable
  makePatchRequest(rest: string, body: any) {
    let headers = new HttpHeaders();

    if (this.usuarioService?.dadosUsuario?.id_token) {
      headers = headers.set('Authorization', `Bearer ${this.usuarioService.dadosUsuario.id_token}`);
    }

    return this.http.patch(`${this.environment.urlBackend}/${rest}`, body, { headers }).pipe(catchError((e) => this.handleHttpError(e)));
  }

  // Método DELETE com Observable
  makeDeleteRequest(rest: string) {
    let headers = new HttpHeaders();

    if (this.usuarioService?.dadosUsuario?.id_token) {
      headers = headers.set('Authorization', `Bearer ${this.usuarioService.dadosUsuario.id_token}`);
    }

    return this.http.delete(`${this.environment.urlBackend}/${rest}`, { headers }).pipe(catchError((e) => this.handleHttpError(e)));
  }

  private handleHttpError<T>(e: any): Observable<T> {
    console.log(e);

    if (e.status === 401) {
      this.router.navigateByUrl('/login');
      return throwError(() => new Error('Usuário não autenticado'));
    }

    let errorReturns = e.error?.title || 'Erro desconhecido';

    if (e.error?.code === 402) {
      errorReturns = 'Erro de comunicação com a API externa. Exibindo apenas dados locais.';
    }

    if (e.status === 400 && e.error?.errors) {
      errorReturns = this.mapErrorsMessages(e.error.errors);
    } else if (e.status === 409 || e.status === 500) {
      errorReturns = this.mapErrorsMessages([e.error]);
    }

    this.dialogService.open(AlertModalComponent, {
      header: 'Erro',
      width: '50%',
      data: { content: errorReturns },
    });

    return throwError(() => new Error(errorReturns));
  }

  private mapErrorsMessages(errors: { field: string; code: string; defaultMessage: string }[]) {
    return errors
      .map((error) => {
        error.defaultMessage = error?.defaultMessage?.includes('deve corresponder') ? `Formato do campo ${error?.field} incorreto.` : error?.defaultMessage;
        error.defaultMessage = error?.defaultMessage?.replace('não deve ser nulo', 'não deve ser vazio');
        if (error?.code?.includes('uniqueConstraintFail')) {
          error.defaultMessage = `Campo ${error.field} já tem seu valor definido para outro registro, tente outro valor.`;
        }

        return _.upperFirst(error.defaultMessage);
      })
      .join('<br>');
  }
}
