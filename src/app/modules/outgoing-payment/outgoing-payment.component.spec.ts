import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutgoingPaymentComponent } from './outgoing-payment.component';

describe('OutgoingPaymentComponent', () => {
  let component: OutgoingPaymentComponent;
  let fixture: ComponentFixture<OutgoingPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutgoingPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutgoingPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
