import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePlotBookingComponent } from './create-plot-booking.component';

describe('CreatePlotBookingComponent', () => {
  let component: CreatePlotBookingComponent;
  let fixture: ComponentFixture<CreatePlotBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePlotBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePlotBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
