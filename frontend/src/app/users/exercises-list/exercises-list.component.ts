import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Exercise, SectionLabel, ForceLabel, MechanicsLabel, ModalityLabel } from '../exercise';
import { ExercisesService } from '../exercises.service';
import { Subject } from 'rxjs';
import 'datatables.net';
import { DataTablesParameters } from 'src/app/datatables-parameters';

@Component({
  selector: 'app-exercises-list',
  templateUrl: './exercises-list.component.html',
  styleUrls: ['./exercises-list.component.css']
})
export class ExercisesListComponent implements OnInit {
  @Output() selected = new EventEmitter<Exercise>();
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<Exercise[]> = new Subject<Exercise[]>();
  exercises: Exercise[];

  constructor(
    private exercisesService: ExercisesService,
  ) { }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (parameters: DataTablesParameters, callback) => {
        console.log(parameters);

        this.exercisesService.getExercises(parameters.start / parameters.length, parameters.length,
          parameters.search.value, parameters.order.map(o => (o.dir == 'desc' ? '-' : '') + parameters.columns[o.column].data))
        .subscribe(paginated => {
          this.exercises = paginated.results;

          let recordsTotal = paginated.count;
          let recordsFiltered = paginated.count;

          callback({
              recordsTotal: recordsTotal,
              recordsFiltered: recordsFiltered,
              data: []
            });
        });
      },
      columns: [{ data: 'name' }, { data: 'section' }, { data: 'modality' }, { data: 'force' }, { data: 'mechanics' }]
    };
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
