import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersFollowListComponent } from './users-follow-list.component';

describe('UsersFollowListComponent', () => {
  let component: UsersFollowListComponent;
  let fixture: ComponentFixture<UsersFollowListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsersFollowListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersFollowListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
