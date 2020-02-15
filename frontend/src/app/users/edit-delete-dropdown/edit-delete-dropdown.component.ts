import { Component, OnInit, Output, EventEmitter,  } from '@angular/core';
import { faTrash, faEdit, faEllipsisV } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-edit-delete-dropdown',
  templateUrl: './edit-delete-dropdown.component.html',
  styleUrls: ['./edit-delete-dropdown.component.css']
})
export class EditDeleteDropdownComponent implements OnInit {
  @Output() edited = new EventEmitter();
  @Output() deleted = new EventEmitter();
  
  faTrash = faTrash;
  faEdit = faEdit;
  faEllipsisV = faEllipsisV;

  optionsVisible: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  edit() {
    this.edited.emit();
  }

  delete() {
    this.deleted.emit();
  }

  toggleOptionsModal() {
    this.optionsVisible = !this.optionsVisible;
  }
}
