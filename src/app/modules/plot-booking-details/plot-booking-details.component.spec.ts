import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotBookingDetailsComponent } from './plot-booking-details.component';

describe('PlotBookingDetailsComponent', () => {
  let component: PlotBookingDetailsComponent;
  let fixture: ComponentFixture<PlotBookingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlotBookingDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlotBookingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
