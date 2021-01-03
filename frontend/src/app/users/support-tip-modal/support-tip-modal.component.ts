import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-support-tip-modal',
  templateUrl: './support-tip-modal.component.html',
  styleUrls: ['./support-tip-modal.component.css']
})
export class SupportTipModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() tier: string;
  @Output() closed = new EventEmitter();

  faCheck = faCheck;

  constructor() { }

  ngOnInit(): void {
  }

  close(): void {
    this.closed.emit();
  }

}
