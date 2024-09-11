import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelJornalistaComponent } from './painel-jornalista.component';

describe('PainelJornalistaComponent', () => {
  let component: PainelJornalistaComponent;
  let fixture: ComponentFixture<PainelJornalistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelJornalistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelJornalistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
