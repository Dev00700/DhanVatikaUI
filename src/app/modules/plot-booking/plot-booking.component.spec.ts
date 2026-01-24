import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotBookingComponent } from './plot-booking.component';

describe('PlotBookingComponent', () => {
  let component: PlotBookingComponent;
  let fixture: ComponentFixture<PlotBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlotBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlotBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
