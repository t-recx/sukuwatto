import { Component, OnInit, OnDestroy } from '@angular/core';
import { Exercise, SectionLabel, ForceLabel, MechanicsLabel, ModalityLabel } from '../exercise';
import { ExercisesService } from '../exercises.service';
import { Subject } from 'rxjs';
import 'datatables.net';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.css']
})
export class ExercisesComponent implements OnInit, OnDestroy {
  exercises: Exercise[];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<Exercise[]> = new Subject<Exercise[]>();

  constructor(
    private exercisesService: ExercisesService,
  ) { }

  ngOnInit() {
    this.dtOptions = {
      pageLength: 10
    };

    this.exercisesService.getExercises().subscribe(exercises => {
       this.exercises = exercises;
       this.dtTrigger.next(this.exercises)
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

  getMechanicsLabel(mechanis: string): string {
    return MechanicsLabel.get(mechanis);
  }

  getModalityLabel(modality: string): string {
    return ModalityLabel.get(modality);
  }
}
