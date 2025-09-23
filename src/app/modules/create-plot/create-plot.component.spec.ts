import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePlotComponent } from './create-plot.component';

describe('CreatePlotComponent', () => {
  let component: CreatePlotComponent;
  let fixture: ComponentFixture<CreatePlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePlotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
