import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import Usuario from '../classes/usuario';
import VinculoGrupoUsuario from '../classes/vinculoGrupoUsuario';
import { DadosNavegadorService } from './dados-navegador.service';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  dadosUsuario: {
    id_token: string;
    usuario: Usuario | null;
  } = { id_token: '', usuario: null };

  constructor(
    private http: HttpClient,
    private dadosNavegador: DadosNavegadorService,
    @Inject(Router) private router: Router // Use o decorador @Inject
  ) {
    const usuarioData = this.dadosNavegador.get('usuario');
    this.dadosUsuario = usuarioData ? JSON.parse(usuarioData) : { id_token: '', usuario: null };
  }

  verificarLogado() {
    return !!this.dadosUsuario.id_token;
  }

  deslogar() {
    this.dadosUsuario = { id_token: '', usuario: null };
    this.dadosNavegador.set('usuario', '');
    this.dadosNavegador.set('permissoes', '');
    this.router.navigateByUrl('/login');
  }

  getDadosUsuario() {
    return this.dadosUsuario;
  }

  setarDadosUsuario(dados: { id_token: string; usuario: Usuario }) {
    this.dadosUsuario = dados;
    this.dadosNavegador.set('usuario', JSON.stringify(dados));
  }

  getPermissoes() {
    if (this.dadosUsuario?.usuario?.grupoUsuario) {
      //@ts-ignore
      return this.dadosUsuario.usuario.grupoUsuario.permissoes
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
    this.dadosUsuario.usuario.grupoUsuario.permissoes = permissoes;
    this.dadosNavegador.set('permissoes', JSON.stringify(permissoes));
  }
}
