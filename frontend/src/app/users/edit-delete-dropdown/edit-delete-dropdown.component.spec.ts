import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDeleteDropdownComponent } from './edit-delete-dropdown.component';

describe('EditDeleteDropdownComponent', () => {
  let component: EditDeleteDropdownComponent;
  let fixture: ComponentFixture<EditDeleteDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDeleteDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDeleteDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
