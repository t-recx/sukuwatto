import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserBioDataDetailComponent } from './user-bio-data-detail.component';

describe('UserBioDataDetailComponent', () => {
  let component: UserBioDataDetailComponent;
  let fixture: ComponentFixture<UserBioDataDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserBioDataDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserBioDataDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
