import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseDetailComponent } from './exercise-detail.component';

describe('ExerciseDetailComponent', () => {
  let component: ExerciseDetailComponent;
  let fixture: ComponentFixture<ExerciseDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExerciseDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
