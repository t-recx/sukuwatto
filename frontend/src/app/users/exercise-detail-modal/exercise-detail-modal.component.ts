import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Exercise } from '../exercise';
import { ExercisesService } from '../exercises.service';
import { AlertService } from 'src/app/alert/alert.service';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-exercise-detail-modal',
  templateUrl: './exercise-detail-modal.component.html',
  styleUrls: ['./exercise-detail-modal.component.css']
})
export class ExerciseDetailModalComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Output() saved = new EventEmitter<Exercise>();
  @Output() closed = new EventEmitter();

  exercise: Exercise;
  triedToSave: boolean = false;

  faSave = faSave;
  faTimes = faTimes;

  constructor(
    private service: ExercisesService,
  ) { }

  ngOnInit() {
    this.init();
  }

  init() {
    this.triedToSave = false;
    this.exercise = new Exercise();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ("visible" in changes) {
      if (this.visible) {
        this.init();
      }
    }
  }

  save() {
    this.triedToSave = true;

    if (!this.valid(this.exercise)) {
      return;
    }

    this.saveExercise();
  }

  saveExercise() {
    this.service.saveExercise(this.exercise).subscribe(exercise => {
      this.triedToSave = false;

      if (exercise) {
        this.saved.emit(exercise);
        this.close();
      }
    });
  }

  valid(exercise: Exercise): boolean {
    if (!exercise.short_name || exercise.short_name.trim().length == 0) {
      return false;
    }

    if (!exercise.name || exercise.name.trim().length == 0) {
      return false;
    }

    return true;
  }
  
  close(): void {
    this.closed.emit();
  }
}
