import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AlertService } from 'src/app/services/alert.service';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-criar-categoria',
  standalone: true,
  imports: [ButtonModule, ProgressSpinnerModule, FormsModule, CommonModule, ReactiveFormsModule, InputTextModule],
  providers: [AlertService, MessageService],
  templateUrl: './criar-categoria.component.html',
  styleUrl: './criar-categoria.component.scss',
})
export class CriarCategoriaComponent {
  categoriaForm!: FormGroup;
  loading: boolean = false;

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig, private alertService: AlertService) {
    this.init();
  }

  async init() {
    this.categoriaForm = new FormGroup({
      id: new FormControl(null),
      nome: new FormControl('', [Validators.required, Validators.minLength(5)]),
      descricao: new FormControl('', [Validators.required, Validators.minLength(5)]),
    });

    if (this.config.data.categoria) {
      console.log(this.config.data.categoria);

      this.categoriaForm.patchValue(this.config.data.categoria);
    }
  }

  cancelar() {
    this.ref.close(false);
  }

  salvar() {
    if (this.categoriaForm.valid) {
      this.loading = true;
      setTimeout(() => {
        this.ref.close(this.categoriaForm.value);
        this.loading = false;
      }, 600);
    }
  }
}
