import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardSocialInteractionComponent } from './card-social-interaction.component';

describe('CardSocialInteractionComponent', () => {
  let component: CardSocialInteractionComponent;
  let fixture: ComponentFixture<CardSocialInteractionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardSocialInteractionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardSocialInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
