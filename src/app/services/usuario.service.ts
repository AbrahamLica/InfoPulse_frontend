import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import Usuario from '../classes/usuario';
import VinculoGrupoUsuario from '../classes/vinculoGrupoUsuario';
import { DadosNavegadorService } from './dados-navegador.service';
import User from '../classes/user';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  dadosUsuario: {
    id_token: string;
    user: User | null;
  } | undefined;

  constructor(
    private http: HttpClient,
    private dadosNavegador: DadosNavegadorService,
    @Inject(Router) private router: Router // Use o decorador @Inject
  ) {
    if(this.dadosNavegador.get('usuario')) {
      //@ts-ignore
    this.dadosUsuario = JSON.parse(dadosNavegador.get('usuario'));
    } else {
      if (this.dadosUsuario?.user?.grupoUsuario) {
        //@ts-ignore
        this.dadosUsuario.user.grupoUsuario.permissoes = JSON.parse(dadosNavegador.get('permissoes'));
      } else {
        this.deslogar();
      }
    }
    
  }

  verificarLogado() {
    if (this.dadosUsuario) {
      return true;
    } else {
      return false;
    }
  }

  deslogar() {
    this.dadosUsuario = { id_token: '', user: null };
    this.dadosNavegador.set('usuario', '');
    this.dadosNavegador.set('permissoes', '');
    this.router.navigateByUrl('/login');
  }

  getDadosUsuario() {
    return this.dadosUsuario;
  }

  setarDadosUsuario(dados: { id_token: string; user: Usuario }) {
    this.dadosUsuario = dados;
    this.dadosNavegador.set('usuario', JSON.stringify(dados));
  }

  getPermissoes() {
    if (this.dadosUsuario?.user?.grupoUsuario) {
      //@ts-ignore
      return this.dadosUsuario.user.grupoUsuario.permissoes
        .filter((value) => value.habilitado)
        .map((value) => {
          //@ts-ignore
          return value.permissao.nome;
        });
    } else {
      this.deslogar();
      return undefined;
    }
  }

  setarPermissoes(permissoes: VinculoGrupoUsuario[]) {
    //@ts-ignore
    this.dadosUsuario.user.grupoUsuario.permissoes = permissoes;
    this.dadosNavegador.set('permissoes', JSON.stringify(permissoes));
  }
}
