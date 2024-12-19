import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { ApiService } from 'src/app/services/api.service';
import { AbstractControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AlertService } from 'src/app/services/alert.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import Usuario from 'src/app/classes/usuario';
import { first } from 'lodash';

@Component({
  selector: 'app-painel-usuario',
  standalone: true,
  imports: [DropdownModule, CommonModule, FormsModule, ButtonModule, InputTextareaModule, InputTextModule, ToastModule, ProgressSpinnerModule, ReactiveFormsModule, CheckboxModule],
  templateUrl: './painel-usuario.component.html',
  styleUrl: './painel-usuario.component.scss',
  providers: [MessageService, AlertService],
})
export class PainelUsuarioComponent {
  dadosForm!: FormGroup;
  usuarioLogado!: Usuario;
  alterarSenha: boolean = false;

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private apiService: ApiService,
    private messageService: MessageService,
    private alertService: AlertService,
    private usuarioService: UsuarioService
  ) {
    this.dadosForm = new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.minLength(5)]),
      login: new FormControl('', [Validators.required]),
      email: new FormControl('', Validators.required),
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required]),
      confirmNewPassword: new FormControl('', [Validators.required]),
    });

    this.usuarioLogado = this.usuarioService.getDadosUsuario()?.user ?? ({} as Usuario);

    this.dadosForm.patchValue({
      firstName: this.usuarioLogado?.firstName,
      login: this.usuarioLogado?.login,
      email: this.usuarioLogado?.email,
    });
  }

  passwordsIguaisValidator(group: AbstractControl) {
    const password = group.get('password');
    const passwordConfirm = group.get('passwordConfirm');

    if (!password || password.invalid || !password.value || !passwordConfirm) {
      return null;
    }

    return password.value === passwordConfirm.value ? null : { mismatch: true };
  }

  haspasswordMismatch(): boolean {
    return this.dadosForm.errors?.['mismatch'] || false;
  }

  habilitarAlterarSenha() {
    this.alterarSenha = true;

    this.dadosForm.patchValue({
      oldPassword: ' ',
      newPassword: ' ',
      confirmNewPassword: ' ',
    });

    setTimeout(() => {
      this.dadosForm.patchValue({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }, 10);
  }

  cancelar() {}

  salvar() {}
}
