import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanSessionGroupComponent } from './plan-session-group.component';

describe('PlanSessionGroupComponent', () => {
  let component: PlanSessionGroupComponent;
  let fixture: ComponentFixture<PlanSessionGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanSessionGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanSessionGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
