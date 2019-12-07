import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutSetEditComponent } from './workout-set-edit.component';

describe('WorkoutSetEditComponent', () => {
  let component: WorkoutSetEditComponent;
  let fixture: ComponentFixture<WorkoutSetEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkoutSetEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutSetEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
