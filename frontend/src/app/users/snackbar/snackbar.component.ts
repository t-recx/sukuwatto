import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css']
})
export class SnackbarComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() messageText: string;
  @Input() actionText: string;
  @Output() actionInvoked = new EventEmitter();
  @Output() actionDismissed = new EventEmitter();

  faTimes = faTimes;

  constructor() { }

  ngOnInit(): void {
  }

  invokeAction() {
    this.actionInvoked.emit();
  }

  dismissAction() {
    this.actionDismissed.emit();
  }
}
