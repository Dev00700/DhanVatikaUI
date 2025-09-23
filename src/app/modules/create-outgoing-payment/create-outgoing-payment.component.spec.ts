import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOutgoingPaymentComponent } from './create-outgoing-payment.component';

describe('CreateOutgoingPaymentComponent', () => {
  let component: CreateOutgoingPaymentComponent;
  let fixture: ComponentFixture<CreateOutgoingPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOutgoingPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOutgoingPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
