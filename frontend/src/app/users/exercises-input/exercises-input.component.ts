import { Component, OnInit, Input, forwardRef, Self } from '@angular/core';
import { faSearch, faEraser } from '@fortawesome/free-solid-svg-icons';
import { Exercise } from '../exercise';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, NgControl, NG_VALIDATORS, Validator, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'exercises-input',
  templateUrl: './exercises-input.component.html',
  styleUrls: ['./exercises-input.component.css'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ExercisesInputComponent),
      multi: true
    },
    { 
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ExercisesInputComponent),
      multi: true
    }
  ]
})
export class ExercisesInputComponent implements OnInit, ControlValueAccessor, Validator {
  @Input() value: Exercise;
  exercises: Exercise[];

  propagateChange = (_: any) => {};
  disabled: boolean = false; // todo change view when disabled

  writeValue(obj: any): void {
    this.setValue(obj);
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

  setValue(exercise: Exercise):void {
    this.value = exercise;
  }

  validate(control: FormControl): ValidationErrors {
    if(!this.value || !this.value.id) {
        return {
          invalid: true
        };
    }

    return null;
  }

  modalVisible: boolean = false;

  faSearch = faSearch;
  faEraser = faEraser;

  constructor() {
  }

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
    this.modalClosed();

    this.value = exercise;

    this.propagateChange(this.value);
  }

  getExerciseName(): string {
    if (this.value && this.value.name) {
      return this.value.name;
    }

    return "";
  }
}
