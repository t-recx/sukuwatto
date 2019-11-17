import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutGroupComponent } from './workout-group.component';

describe('WorkoutGroupComponent', () => {
  let component: WorkoutGroupComponent;
  let fixture: ComponentFixture<WorkoutGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkoutGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
