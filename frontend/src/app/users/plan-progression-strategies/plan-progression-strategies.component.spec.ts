import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanProgressionStrategiesComponent } from './plan-progression-strategies.component';

describe('PlanProgressionStrategiesComponent', () => {
  let component: PlanProgressionStrategiesComponent;
  let fixture: ComponentFixture<PlanProgressionStrategiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanProgressionStrategiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanProgressionStrategiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
