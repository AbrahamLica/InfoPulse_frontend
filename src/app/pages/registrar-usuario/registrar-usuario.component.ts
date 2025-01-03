import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import Usuario from 'src/app/classes/usuario';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-registrar-usuario',
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
    RouterModule,
  ],
  templateUrl: './registrar-usuario.component.html',
  styleUrl: './registrar-usuario.component.scss',
  providers: [DialogService, DynamicDialogRef, AlertService, DynamicDialogConfig, MessageService],
})
export class RegistrarUsuarioComponent {
  usuario!: Usuario;

  usuarioForm!: FormGroup;
  usuarioLogado!: Usuario;
  #document = inject(DOCUMENT);
  isDarkMode = false;

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private apiService: ApiService,
    private messageService: MessageService,
    private alertService: AlertService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    
    const linkElement = this.#document.getElementById('app-theme') as HTMLLinkElement;
    if (linkElement.href.includes('light')) {
      this.isDarkMode = true;
    } else {
      this.isDarkMode = false;
    }

    this.usuarioForm = new FormGroup(
      {
        nome: new FormControl(' ', [Validators.required, Validators.minLength(5)]),
        login: new FormControl(' ', [Validators.required, Validators.minLength(10)]),
        senha: new FormControl(' ', [Validators.required, Validators.minLength(10)]),
        senhaConfirm: new FormControl(' ', [Validators.required, Validators.minLength(10)]),
        email: new FormControl(' ', Validators.required),
      },
      { validators: this.passwordsIguaisValidator }
    );

    setTimeout(() => {

      this.usuarioForm.patchValue({
        nome: '',
        login: '',
        senha: '',
        senhaConfirm: '',
        email: '',
      });
    }, 100);
  }

  passwordsIguaisValidator(group: AbstractControl) {
    const senha = group.get('senha');
    const senhaConfirm = group.get('senhaConfirm');

    if (!senha || senha.invalid || !senha.value || !senhaConfirm) {
      return null;
    }

    return senha.value === senhaConfirm.value ? null : { mismatch: true };
  }

  haspasswordMismatch(): boolean {
    return this.usuarioForm.errors?.['mismatch'] || false;
  }

  cancelar() {
    this.router.navigateByUrl('/login');
  }

  salvar() {
    if (this.usuarioForm.valid) {
      this.apiService.makePostRequest(`v1/usuarios`, this.usuarioForm.value).subscribe({
        next: (response: any) => {},
        error: (e) => {
          console.log(e);
        },
        complete: () => {
          this.messageService.add({ severity: 'success', summary: 'Usuário cadastrado com sucesso!', icon: 'pi-check', key: 'tl', life: 2000 });
          setTimeout(() => {
            this.router.navigateByUrl('/login');
          }, 2000);
        },
      });
    }
  }
}
