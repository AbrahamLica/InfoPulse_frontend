import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelUsuarioComponent } from './painel-usuario.component';

describe('PainelUsuarioComponent', () => {
  let component: PainelUsuarioComponent;
  let fixture: ComponentFixture<PainelUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelUsuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
