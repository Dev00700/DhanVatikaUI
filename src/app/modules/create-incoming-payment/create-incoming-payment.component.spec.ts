import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateIncomingPaymentComponent } from './create-incoming-payment.component';

describe('CreateIncomingPaymentComponent', () => {
  let component: CreateIncomingPaymentComponent;
  let fixture: ComponentFixture<CreateIncomingPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateIncomingPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateIncomingPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
