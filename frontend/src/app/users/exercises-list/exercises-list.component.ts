import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Exercise, SectionLabel, ForceLabel, MechanicsLabel, ModalityLabel, LevelLabel, ExerciseTypeLabel } from '../exercise';
import { ExercisesService } from '../exercises.service';
import { Subject, Subscription, fromEvent, of } from 'rxjs';
import { Paginated } from '../paginated';
import { Router } from '@angular/router';
import { faSearch, faBackspace } from '@fortawesome/free-solid-svg-icons';
import { map } from 'rxjs/internal/operators/map';
import { filter, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { LoadingService } from '../loading.service';
import { ErrorService } from 'src/app/error.service';
import { AlertService } from 'src/app/alert/alert.service';

@Component({
  selector: 'app-exercises-list',
  templateUrl: './exercises-list.component.html',
  styleUrls: ['./exercises-list.component.css']
})
export class ExercisesListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() page: number;
  @Input() pageSize: number = 10;
  @Input() searchFilter: string;
  @Input() ordering: string;
  @Input() link: any;
  @Input() queryParams: {};
  @Input() exerciseType: string;

  @Output() selected = new EventEmitter<Exercise>();

  faSearch = faSearch;
  faBackspace = faBackspace;

  lastSearchedFilter = '';
  columnOrder = {}

  exercises: Exercise[] = [];

  paramChangedSubscription: Subscription;
  paginatedExercises: Paginated<Exercise>;
  searchSubscription: Subscription;

  constructor(
    private exercisesService: ExercisesService,
    private router: Router,
    private loadingService: LoadingService,
    private errorService: ErrorService,
    private alertService: AlertService,
  ) { }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  ngOnInit() {
    this.lastSearchedFilter = '';
    this.setupSearch();
  }

  exerciseTracker(index, item) {
    return item.id;
  }

  setupSearch() {
    const searchBox = document.getElementById('search-input');

    const typeahead = fromEvent(searchBox, 'input').pipe(
      map((e: KeyboardEvent) => (e.target as HTMLInputElement).value),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(() => of(true))
    );

    this.searchSubscription = typeahead.subscribe(() => {
      this.search();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.orderingToColumnOrder();
    this.loadExercises();
  }

  loadExercises() {
    if (!this.page) {
      this.page = 1;
    }

    this.loadingService.load();
    this.exercisesService.getExercises(this.page, this.pageSize, this.searchFilter, this.ordering, this.exerciseType)
    .pipe(
      catchError(this.errorService.handleError<Paginated<Exercise>>('getExercises', (e: any) => {
        if (e.status && e.status == 404 && this.page > 1) {
          this.alertService.error('Unable to fetch exercises: no exercises on specified page');
        }
        else {
          this.alertService.error('Unable to fetch exercises');
        }
      }, new Paginated<Exercise>()))
    )
      .subscribe(paginated => {
        this.setDescriptions(paginated.results);
        this.paginatedExercises = paginated;
        this.exercises = paginated.results ? paginated.results : [];

      this.lastSearchedFilter = this.searchFilter;
      this.loadingService.unload();
    });
  }

  search() {
    if (this.lastSearchedFilter != this.searchFilter) {
      this.page = 1;
    }

    if (this.link) {
      this.queryParams = this.getQueryParams();
      let navigatedLink = this.link;

      if (this.page && this.page > 1) {
        navigatedLink = this.link.concat(this.page);
      }

      this.router.navigate(navigatedLink, { queryParams: this.getQueryParams() });
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

    if (this.exerciseType && this.exerciseType.length > 0) {
      queryParams['type']= this.exerciseType;
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
