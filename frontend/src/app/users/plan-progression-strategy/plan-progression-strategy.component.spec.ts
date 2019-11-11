import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanProgressionStrategyComponent } from './plan-progression-strategy.component';

describe('PlanProgressionStrategyComponent', () => {
  let component: PlanProgressionStrategyComponent;
  let fixture: ComponentFixture<PlanProgressionStrategyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanProgressionStrategyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanProgressionStrategyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
