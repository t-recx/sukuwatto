import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutOverviewCardComponent } from './workout-overview-card.component';

describe('WorkoutOverviewCardComponent', () => {
  let component: WorkoutOverviewCardComponent;
  let fixture: ComponentFixture<WorkoutOverviewCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkoutOverviewCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutOverviewCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
