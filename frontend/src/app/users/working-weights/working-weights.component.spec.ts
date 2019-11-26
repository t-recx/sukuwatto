import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingWeightsComponent } from './working-weights.component';

describe('WorkingWeightsComponent', () => {
  let component: WorkingWeightsComponent;
  let fixture: ComponentFixture<WorkingWeightsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkingWeightsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkingWeightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
