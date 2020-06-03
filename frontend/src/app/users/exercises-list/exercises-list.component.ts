import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Exercise, SectionLabel, ForceLabel, MechanicsLabel, ModalityLabel, LevelLabel, ExerciseTypeLabel } from '../exercise';
import { ExercisesService } from '../exercises.service';
import { Subject, Subscription } from 'rxjs';
import { Paginated } from '../paginated';
import { Router } from '@angular/router';
import { faSearch, faBackspace } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-exercises-list',
  templateUrl: './exercises-list.component.html',
  styleUrls: ['./exercises-list.component.css']
})
export class ExercisesListComponent implements OnInit, OnChanges {
  @Input() page: number;
  @Input() pageSize: number = 10;
  @Input() searchFilter: string;
  @Input() ordering: string;
  @Input() link: any;
  @Input() queryParams: {};

  @Output() selected = new EventEmitter<Exercise>();

  faSearch = faSearch;
  faBackspace = faBackspace;

  lastSearchedFilter = '';
  columnOrder = {}

  loading: boolean = false;

  exercises: Exercise[];

  paramChangedSubscription: Subscription;
  paginatedExercises: Paginated<Exercise>;

  constructor(
    private exercisesService: ExercisesService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.lastSearchedFilter = '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.orderingToColumnOrder();
    this.loadExercises();
  }

  loadExercises() {
    if (!this.page) {
      this.page = 1;
    }

    this.loading = true;
    this.exercisesService.getExercises(this.page, this.pageSize, this.searchFilter, this.ordering)
    .subscribe(paginated => {
      this.setDescriptions(paginated.results);
      this.paginatedExercises = paginated;
      this.exercises = paginated.results;
      this.lastSearchedFilter = this.searchFilter;
      this.loading = false;
    });
  }

  search() {
    if (this.lastSearchedFilter != this.searchFilter) {
      this.page = 1;
    }

    if (this.link) {
      this.queryParams = this.getQueryParams();
      this.router.navigate(this.link.concat(this.page), { queryParams: this.getQueryParams() });
    }
    else {
      this.loadExercises();
    }
  }

  clearFilters() {
    this.searchFilter = '';
    this.search();
  }

  sortIndex = 0;

  orderingToColumnOrder() {
    if (this.ordering) {
      this.ordering.split(',').forEach(o => 
        {
          let columnName = o;
          if (o[0] == '-') {
            columnName = o.substr(1);
          }
          this.columnOrder[columnName] = [this.sortIndex, o];
          this.sortIndex++;
        });
    }
    else {
      this.columnOrder = {};
    }
  }

  toggleSort(column: string) {
    if (!this.columnOrder[column]) {
      this.sortIndex++;
      this.columnOrder[column] = [this.sortIndex, column];
    }
    else if (this.columnOrder[column][1][0] == '-') {
      this.columnOrder[column] = null;
    }
    else {
      this.columnOrder[column][1] = '-' + this.columnOrder[column][1];
    }

    this.ordering = Object.values(this.columnOrder).filter(x => x).sort((a, b) => a[0] - b[0]).map(x => x[1]).join(',');
    this.search();

    if (Object.values(this.columnOrder).filter(x => x).length == 0) {
      this.sortIndex = 0;
    }
  }

  getQueryParams() {
    let queryParams = {}
    
    if (this.searchFilter && this.searchFilter.length > 0) {
      queryParams['search']= this.searchFilter;
    }

    if (this.ordering && this.ordering.length > 0) {
      queryParams['ordering']= this.ordering;
    }

    return queryParams;
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
        e.exercise_typeLabel = this.getExerciseTypeLabel(e.exercise_type);
        e.sectionLabel = this.getSectionLabel(e.section);
        e.forceLabel = this.getForceLabel(e.force);
        e.mechanicsLabel = this.getMechanicsLabel(e.mechanics);
        e.modalityLabel = this.getModalityLabel(e.modality);
        e.levelLabel = this.getLevelLabel(e.level);
      });
    }
  }

  getExerciseTypeLabel(exercise_type: string): string {
    return ExerciseTypeLabel.get(exercise_type);
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

  getLevelLabel(level: string): string {
    return LevelLabel.get(level);
  }

  select(exercise) {
    this.selected.emit(exercise);
  }
}
