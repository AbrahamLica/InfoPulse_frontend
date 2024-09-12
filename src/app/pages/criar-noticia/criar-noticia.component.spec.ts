import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriarNoticiaComponent } from './criar-noticia.component';

describe('CriarNoticiaComponent', () => {
  let component: CriarNoticiaComponent;
  let fixture: ComponentFixture<CriarNoticiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriarNoticiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriarNoticiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
