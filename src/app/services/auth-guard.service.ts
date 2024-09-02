import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UsuarioService } from './usuario.service';
import { DadosNavegadorService } from './dados-navegador.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate{

  constructor(private router: Router, private usuarioService: UsuarioService, dadosNavegador: DadosNavegadorService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){

      console.log();
      
      

        if (this.usuarioService.verificarLogado()) {

            return true;

        }else{

            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});

            return false;

        }

    }
}
