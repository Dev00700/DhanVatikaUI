import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomingPaymentComponent } from './incoming-payment.component';

describe('IncomingPaymentComponent', () => {
  let component: IncomingPaymentComponent;
  let fixture: ComponentFixture<IncomingPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomingPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomingPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
