import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingWeightComponent } from './working-weight.component';

describe('WorkingWeightComponent', () => {
  let component: WorkingWeightComponent;
  let fixture: ComponentFixture<WorkingWeightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkingWeightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkingWeightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
