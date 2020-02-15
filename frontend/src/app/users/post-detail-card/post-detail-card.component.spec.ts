import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostDetailCardComponent } from './post-detail-card.component';

describe('PostDetailCardComponent', () => {
  let component: PostDetailCardComponent;
  let fixture: ComponentFixture<PostDetailCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostDetailCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostDetailCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
