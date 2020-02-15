import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeObjectConstructComponent } from './home-object-construct.component';

describe('HomeObjectConstructComponent', () => {
  let component: HomeObjectConstructComponent;
  let fixture: ComponentFixture<HomeObjectConstructComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeObjectConstructComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeObjectConstructComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
