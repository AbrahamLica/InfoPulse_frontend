import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UsuarioService } from './usuario.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
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
  makeGetRequest(rest: string, anonimo?: boolean) {
    let headers = new HttpHeaders();

    if (!anonimo && this.usuarioService?.dadosUsuario?.id_token) {
      headers = headers.set('Authorization', `Bearer ${this.usuarioService.dadosUsuario.id_token}`);
    }

    return this.http.get(`${this.environment.urlBackend}/${rest}`, { headers }).pipe(
      catchError((e) => this.handleHttpError(e)) // Tratamento de erro com catchError
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

  // Método para tratar erros HTTP
  private handleHttpError(e: any) {
    console.log(e);

    if (e.status === 401) {
      this.router.navigateByUrl('/login');
      return of(null);
    }

    let errorReturns = e.error?.title;

    if (e.error.code == 402) {
      errorReturns = 'Não foi possível fazer a comunicação com a API externa de notícias. O sistema irá exibir apenas as notícias cadastradas no sistema local.';
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

    return throwError({ error: true, code: e.status, message: errorReturns });
  }

  // Mapeamento de mensagens de erro
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
