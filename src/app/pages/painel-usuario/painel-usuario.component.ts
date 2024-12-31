import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { ApiService } from 'src/app/services/api.service';
import {
  AbstractControl,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
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

@Component({
  selector: 'app-painel-usuario',
  standalone: true,
  imports: [
    DropdownModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextareaModule,
    InputTextModule,
    ToastModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    CheckboxModule,
  ],
  templateUrl: './painel-usuario.component.html',
  styleUrl: './painel-usuario.component.scss',
  providers: [MessageService, AlertService],
})
export class PainelUsuarioComponent {
  dadosForm!: FormGroup;
  usuarioLogado!: any;
  alterarSenha: boolean = false;
  idUsuarioLogado = 0;

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private apiService: ApiService,
    private messageService: MessageService,
    private alertService: AlertService,
    private usuarioService: UsuarioService
  ) {
    this.dadosForm = new FormGroup(
      {
        nome: new FormControl('', [
          Validators.required,
          Validators.minLength(5),
        ]),
        login: new FormControl('', [Validators.required]),
        email: new FormControl('', Validators.required),
        currentPassword: new FormControl(''),
        newPassword: new FormControl(''),
        confirmNewPassword: new FormControl(''),
      },
      { validators: this.passwordsIguaisValidator }
    );

    this.apiService
      .makeGetRequest(
        `usuarios?size=99999&userId.equals=${
          this.usuarioService.getDadosUsuario()?.user?.id
        }`
      )
      .subscribe({
        next: async (response: any) => {
          this.idUsuarioLogado = response[0].id;
          this.usuarioLogado = response[0];
          this.dadosForm.patchValue({
            nome: this.usuarioLogado?.nome,
            login: this.usuarioLogado?.login,
            email: this.usuarioLogado?.email,
          });
          console.log(this.usuarioLogado);
        },
      });
  }

  passwordsIguaisValidator(group: AbstractControl) {
    const password = group.get('newPassword');
    const passwordConfirm = group.get('confirmNewPassword');

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

    // Adiciona os validadores aos campos de senha
    this.dadosForm.get('currentPassword')?.setValidators([Validators.required]);
    this.dadosForm
      .get('newPassword')
      ?.setValidators([Validators.required, Validators.minLength(5)]);
    this.dadosForm
      .get('confirmNewPassword')
      ?.setValidators([Validators.required]);

    // Atualiza as validações
    this.dadosForm.get('currentPassword')?.updateValueAndValidity();
    this.dadosForm.get('newPassword')?.updateValueAndValidity();
    this.dadosForm.get('confirmNewPassword')?.updateValueAndValidity();

    this.dadosForm.patchValue({
      currentPassword: ' ',
      newPassword: ' ',
      confirmNewPassword: ' ',
    });

    setTimeout(() => {
      this.dadosForm.patchValue({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }, 10);
  }

  cancelar() {
    this.ref.close(false);
  }

  salvar() {
    let bodyPassword: any = {
      currentPassword: this.dadosForm.get('currentPassword')?.value,
      newPassword: this.dadosForm.get('newPassword')?.value,
    };

    if (this.dadosForm.valid) {
      if (this.alterarSenha == true) {
        this.apiService
          .makePostRequest(`account/change-password`, bodyPassword)
          .subscribe({
            next: async (response: any) => {
              
            },
            complete: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Senha alterada com sucesso!',
                icon: 'pi-check',
                key: 'tl',
                life: 3000,
              });
              setTimeout(() => {
                this.ref.close();
              }, 3000);
            }
          });
      } else {
        this.apiService
          .makePatchRequest(`v1/usuarios/${this.idUsuarioLogado}`, {
            id: this.idUsuarioLogado,
            nome: this.dadosForm.get('nome')?.value,
            login: this.dadosForm.get('login')?.value,
            email: this.dadosForm.get('email')?.value,
            user: this.usuarioLogado,
          })
          .subscribe({
            next: async (response: any) => {
              
            },
            complete: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Dados do usuário alterados com sucesso!',
                icon: 'pi-check',
                key: 'tl',
                life: 3000,
              });
              setTimeout(() => {
                this.ref.close();
              }, 3000);
            }
          });
      }
    }
  }
}
