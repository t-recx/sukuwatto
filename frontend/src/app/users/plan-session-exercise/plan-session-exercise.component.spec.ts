import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanSessionExerciseComponent } from './plan-session-exercise.component';

describe('PlanSessionExerciseComponent', () => {
  let component: PlanSessionExerciseComponent;
  let fixture: ComponentFixture<PlanSessionExerciseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanSessionExerciseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanSessionExerciseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
