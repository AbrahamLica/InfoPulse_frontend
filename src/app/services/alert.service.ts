import { Injectable } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertModalComponent } from '../util/alert-modal/alert-modal.component';
import { ConfirmModalComponent } from '../util/confirm-modal/confirm-modal.component';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig, private dialogService: DialogService) {}

  exibirErroOuAlerta(titulo: string, conteudo: string, width: string): DynamicDialogRef {
    return this.dialogService.open(AlertModalComponent, {
      header: titulo,
      width: width,
      contentStyle: { 'max-height': '300px', overflow: 'auto' },
      baseZIndex: 10000,
      data: {
        content: conteudo,
      },
      focusOnShow: false,
      focusTrap: false,
      closeOnEscape: false,
    });
  }

  exibirConfirmacao(titulo: string, conteudo: string, width: string): DynamicDialogRef {
    return this.dialogService.open(ConfirmModalComponent, {
      header: titulo,
      width: width,
      data: {
        content: conteudo,
      },
    });
  }
}
