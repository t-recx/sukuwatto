import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Exercise, SectionLabel, ForceLabel, MechanicsLabel, ModalityLabel } from '../exercise';
import { ExercisesService } from '../exercises.service';
import { Subject, Subscription } from 'rxjs';
import { Paginated } from '../paginated';

@Component({
  selector: 'app-exercises-list',
  templateUrl: './exercises-list.component.html',
  styleUrls: ['./exercises-list.component.css']
})
export class ExercisesListComponent implements OnInit, OnChanges {
  @Input() page: number;
  @Input() pageSize: number = 10;
  @Input() searchFilter: string;
  @Input() ordering: string[];
  @Input() link: any;

  @Output() selected = new EventEmitter<Exercise>();

  exercises: Exercise[];

  paramChangedSubscription: Subscription;
  paginatedExercises: Paginated<Exercise>;

  constructor(
    private exercisesService: ExercisesService,
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadExercises();
  }

  loadExercises() {
    if (!this.page) {
      this.page = 1;
    }

    this.exercisesService.getExercises(this.page, this.pageSize, this.searchFilter, this.ordering)
    .subscribe(paginated => {
      this.setDescriptions(paginated.results);
      this.paginatedExercises = paginated;
      this.exercises = paginated.results;
    });
  }

  navigateToPage(page: number) {
    if (!this.link) {
      this.page = page;
      this.loadExercises();
    }
  }

  setDescriptions(exercises: Exercise[]) {
    if (exercises) {
      exercises.forEach(e => {
        e.sectionLabel = this.getSectionLabel(e.section);
        e.forceLabel = this.getForceLabel(e.force);
        e.mechanicsLabel = this.getMechanicsLabel(e.mechanics);
        e.modalityLabel = this.getModalityLabel(e.modality);
      });
    }
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
