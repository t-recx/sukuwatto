import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanSessionGroupExerciseComponent } from './plan-session-group-exercise.component';

describe('PlanSessionExerciseComponent', () => {
  let component: PlanSessionGroupExerciseComponent;
  let fixture: ComponentFixture<PlanSessionGroupExerciseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanSessionGroupExerciseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanSessionGroupExerciseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
