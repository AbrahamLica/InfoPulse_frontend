import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UsuarioService } from './usuario.service';
import { Router, ActivatedRoute } from '@angular/router';
import _ from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  environment = {
    production: false,
    urlBackend: 'http://localhost:8080/api',
    urlFilesBackend: 'http://localhost:8080'
};

  constructor(private http: HttpClient, private usuarioService: UsuarioService, private router: Router, private activatedRoute: ActivatedRoute) {
  }

  makeGetRequestAsync(rest: any, anonimo?: boolean) {
    return this.http.get(`${this.environment.urlBackend}/${rest}`, {
      headers: anonimo ? {} : {
        "Authorization": `Bearer ${this.usuarioService?.dadosUsuario?.id_token}`
      }
    }).toPromise().catch(e => {
      if (e.status == 401) {
        this.router.navigateByUrl("/login");
        return null;  // Retorna null se o usuário não estiver autenticado
      } else {
        let errorReturns = e.error?.title;
        if (e.status == 400 && e.error?.errors) errorReturns = this.mapErrorsMessages(e.error.errors);
        if (e.status == 409) errorReturns = this.mapErrorsMessages([e.error]);
        if (e.status == 500) errorReturns = this.mapErrorsMessages([e.error]);
        return {
          error: true,
          code: e.status,
          message: errorReturns
        };
      }
    });
  }
  

  async makeGetRequest(rest: any) {
    try {
      const result = await this.http.get(`${this.environment.urlBackend}/${rest}`, {
        headers: {
          "Authorization": `Bearer ${this.usuarioService?.dadosUsuario?.id_token}`
        }
      }).toPromise();
      return result;
    } catch (e: any) {
      if (e.status == 401) {
        this.router.navigateByUrl("/login");
        return null;  // Retorna null se o usuário não estiver autenticado
      } else {
        let errorReturns = e.error?.title;
        if (e.status == 400 && e.error?.errors) errorReturns = this.mapErrorsMessages(e.error.errors);
        if (e.status == 409) errorReturns = this.mapErrorsMessages([e.error]);
        if (e.status == 500) errorReturns = this.mapErrorsMessages([e.error]);
        return {
          error: true,
          code: e.status,
          message: errorReturns
        };
      }
    }
  }
  

  async makePostRequest(rest: any, body: any) {
    let send = this.emptyToNull(_.cloneDeep(body));
    try {
      const result = await this.http.post(`${this.environment.urlBackend}/${rest}`, send, {
        headers: {
          "Authorization": `Bearer ${this.usuarioService?.dadosUsuario?.id_token}`
        }
      }).toPromise();
      return result;
    } catch (e: any) {
      if (e.status == 401) {
        this.router.navigateByUrl("/login");
        return null;  // Retorna null se o usuário não estiver autenticado
      } else {
        let errorReturns = e.error?.title;
        if (e.status == 400 && e.error?.errors) errorReturns = this.mapErrorsMessages(e.error.errors);
        if (e.status == 409) errorReturns = this.mapErrorsMessages([e.error]);
        if (e.status == 500) errorReturns = this.mapErrorsMessages([e.error]);
        console.log(errorReturns);
        return null;
      }
    }
  }
  
  mapErrorsMessages(errors: { field: string, code: string, defaultMessage: string }[]) {

      return errors.map(error => {

          error.defaultMessage = error?.defaultMessage?.includes("deve corresponder") ? `Formato do campo ${error?.field} incorreto.` : error?.defaultMessage;
          error.defaultMessage = error?.defaultMessage?.replace("não deve ser nulo", "não deve ser vazio");
          if (error?.code?.includes("uniqueConstraintFail")) {

              error.defaultMessage = `Campo ${error.field} já tem seu valor definido para outro registro, tente outro valor para evitar dados duplicados no sistema.`
          }

          return _.upperFirst(error.defaultMessage);
      }).join("<br>");

  }

  async makePutRequest(rest: any, body: any) {
    let send = this.emptyToNull(_.cloneDeep(body));
    try {
      const result = await this.http.put(`${this.environment.urlBackend}/${rest}`, send, {
        headers: {
          "Authorization": `Bearer ${this.usuarioService?.dadosUsuario?.id_token}`
        }
      }).toPromise();
      return result;
    } catch (e: any) {
      if (e.status == 401) {
        this.router.navigateByUrl("/login");
        return null;  // Retorna null se o usuário não estiver autenticado
      } else {
        let errorReturns = e.error?.title;
        if (e.status == 400 && e.error?.errors) errorReturns = this.mapErrorsMessages(e.error.errors);
        if (e.status == 409) errorReturns = this.mapErrorsMessages([e.error]);
        console.log(errorReturns);
        return null;
      }
    }
  }
  

  private emptyToNull(body: any) {
      let keys = Object.keys(body);
      for (let key of keys) {
          if (typeof body[key] != 'boolean') {
              if (!body[key] || Object.is(body[key], {})) body[key] = null;
          }
      }
      return body;
  }

  async makePatchRequest(rest: any, body: any) {
    let send = this.emptyToNull(_.cloneDeep(body));
    try {
      const result = await this.http.patch(`${this.environment.urlBackend}/${rest}`, send, {
        headers: {
          "Authorization": `Bearer ${this.usuarioService?.dadosUsuario?.id_token}`
        }
      }).toPromise();
      return result;
    } catch (e: any) {
      if (e.status == 401) {
        this.router.navigateByUrl("/login");
        return null;  // Retorna null se o usuário não estiver autenticado
      } else {
        let errorReturns = e.error?.title;
        if (e.status == 400 && e.error?.errors) errorReturns = this.mapErrorsMessages(e.error.errors);
        if (e.status == 409) errorReturns = this.mapErrorsMessages([e.error]);
        console.log(errorReturns);
        return null;
      }
    }
  }
  

  async makeDeleteRequest(rest: string) {
    const url = `${this.environment.urlBackend}/${rest}`;
  
    try {
      return await this.http.delete(url, {
        headers: {
          "Authorization": `Bearer ${this.usuarioService?.dadosUsuario?.id_token}`
        }
      }).toPromise();
    } catch (e: any) {
      if (e.status == 401) {
        this.router.navigateByUrl("/login");
        return null;  // Retorna null se o usuário não estiver autenticado
      } else {
        let errorReturns = e.error?.title;
        if (e.status == 400 && e.error?.errors) errorReturns = this.mapErrorsMessages(e.error.errors);
        if (e.status == 409 && url.includes('clientes')) {
          errorReturns = "Você não pode excluir um cliente, enquanto ainda existem registros do mesmo no sistema. Exclua todos os registros referente ao cliente, em seguida tente excluir o seu cadastro novamente.";
        } else {
          this.mapErrorsMessages([e.error]);
        }
        console.log(errorReturns);
        return {
          error: true,
          code: e.status,
          message: errorReturns
        };
      }
    }
  }
  

  
}
