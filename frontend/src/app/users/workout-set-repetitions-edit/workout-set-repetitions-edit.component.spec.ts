import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutSetRepetitionsEditComponent } from './workout-set-repetitions-edit.component';

describe('WorkoutSetRepetitionsEditComponent', () => {
  let component: WorkoutSetRepetitionsEditComponent;
  let fixture: ComponentFixture<WorkoutSetRepetitionsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkoutSetRepetitionsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutSetRepetitionsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
