import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutSetComponent } from './workout-set.component';

describe('WorkoutSetComponent', () => {
  let component: WorkoutSetComponent;
  let fixture: ComponentFixture<WorkoutSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkoutSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
