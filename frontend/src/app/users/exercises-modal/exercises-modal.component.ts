import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Exercise } from '../exercise';

@Component({
  selector: 'app-exercises-modal',
  templateUrl: './exercises-modal.component.html',
  styleUrls: ['./exercises-modal.component.css']
})
export class ExercisesModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() exercises: Exercise[] = null;
  @Output() selected = new EventEmitter<Exercise>();
  @Output() closed = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  select(exercise): void {
    this.selected.emit(exercise);
  }

  newExercise(): void {
    // todo
  }

  close(): void {
    this.closed.emit();
  }
}
