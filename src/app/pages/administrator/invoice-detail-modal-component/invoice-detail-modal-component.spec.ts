import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDetailModalComponent } from './invoice-detail-modal-component';

describe('InvoiceDetailModalComponent', () => {
  let component: InvoiceDetailModalComponent;
  let fixture: ComponentFixture<InvoiceDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceDetailModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
