import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerInstallmentsComponent } from './customer-installments.component';

describe('CustomerInstallmentsComponent', () => {
  let component: CustomerInstallmentsComponent;
  let fixture: ComponentFixture<CustomerInstallmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerInstallmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerInstallmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
