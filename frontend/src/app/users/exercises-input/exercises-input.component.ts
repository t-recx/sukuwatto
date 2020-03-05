import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges, forwardRef } from '@angular/core';
import { faSearch, faEraser } from '@fortawesome/free-solid-svg-icons';
import { Exercise } from '../exercise';
import { ControlValueAccessor, SelectControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-exercises-input',
  templateUrl: './exercises-input.component.html',
  styleUrls: ['./exercises-input.component.css'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ExercisesInputComponent),
      multi: true
    }
  ]
})
export class ExercisesInputComponent implements OnInit, ControlValueAccessor {
  propagateChange = (_: any) => {};
  disabled: boolean = false; // todo change view when disabled

  writeValue(obj: any): void {
    this.setValue(+obj);
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  setValue(id: number):void {
    this.value = id;

    if (this.value) {
      this.exercise = this.exercises.filter(e => e.id == this.value)[0];
    }
    else {
      this.exercise = null;
    }
  }

  @Input() value: number;
  @Input() exercises: Exercise[];

  exercise: Exercise;

  modalVisible: boolean = false;

  faSearch = faSearch;
  faEraser = faEraser;

  constructor() { }

  ngOnInit() {
  }

  select(exercise) {
    this.setExercise(exercise);
  }

  search() {
    this.modalVisible = true;
  }

  clear() {
    this.setExercise(null);
  }

  modalClosed() {
    this.modalVisible = false;
  }

  setExercise(exercise: Exercise) {
    this.exercise = exercise;

    if (this.exercise) {
      this.propagateChange(this.exercise.id);
    }
    else {
      this.propagateChange(null);
    }
  }
}
