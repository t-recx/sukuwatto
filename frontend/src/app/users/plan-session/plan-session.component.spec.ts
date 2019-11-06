import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanSessionComponent } from './plan-session.component';

describe('PlanSessionComponent', () => {
  let component: PlanSessionComponent;
  let fixture: ComponentFixture<PlanSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
