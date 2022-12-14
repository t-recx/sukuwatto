import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.css']
})
export class DeleteModalComponent {
  @Input() visible: boolean = false;
  @Input() title: string = 'Delete resource?';
  @Input() body: string = 'This will delete your resource and associated data! Are you sure you want to proceed?';
  @Output() deleted = new EventEmitter();
  @Output() canceled = new EventEmitter();

  faCheck = faCheck;
  faTimes = faTimes;

  delete() {
    this.visible = false;
    this.deleted.emit();
  }

  cancel() {
    this.canceled.emit();
  }
}
