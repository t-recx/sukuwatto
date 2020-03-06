import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { Exercise, SectionLabel, ForceLabel, MechanicsLabel, ModalityLabel } from '../exercise';
import { ExercisesService } from '../exercises.service';
import { Subject } from 'rxjs';
import 'datatables.net';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-exercises-list',
  templateUrl: './exercises-list.component.html',
  styleUrls: ['./exercises-list.component.css']
})
export class ExercisesListComponent implements OnInit, OnDestroy {
  @Output() selected = new EventEmitter<Exercise>();
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<Exercise[]> = new Subject<Exercise[]>();
  exercises: Exercise[];

  constructor(
    private exercisesService: ExercisesService,
  ) { }

  ngOnInit() {
    this.dtOptions = {
      pageLength: 10
    };

    this.exercisesService.getExercises().subscribe(exercises => {
      this.exercises = exercises;
      this.dtTrigger.next(this.exercises);
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getSectionLabel(section: string): string {
    return SectionLabel.get(section);
  }

  getForceLabel(force: string): string {
    return ForceLabel.get(force);
  }

  getMechanicsLabel(mechanics: string): string {
    return MechanicsLabel.get(mechanics);
  }

  getModalityLabel(modality: string): string {
    return ModalityLabel.get(modality);
  }

  select(exercise) {
    this.selected.emit(exercise);
  }
}
