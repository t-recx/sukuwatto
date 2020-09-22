import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { UserProgressService } from '../user-progress.service';
import { Mechanics } from '../exercise';
import { UserProgressData } from '../user-progress-data';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { UserProgressChartData, UserProgressChartSeries, UserProgressChartDataPoint, UserProgressChartType } from '../user-progress-chart-data';
import { tap } from 'rxjs/operators';
import { LoadingService } from '../loading.service';
import { WorkoutsService } from '../workouts.service';
import { UserAvailableChartData } from '../user-available-chart-data';
import { UnitsService } from '../units.service';
import { Workout } from '../workout';
import { Observable, of } from 'rxjs';
import { ChartCategory } from '../chart-category';

@Component({
    selector: 'app-user-progress-charts',
    templateUrl: './user-progress-charts.component.html',
    styleUrls: ['./user-progress-charts.component.css']
})
export class UserProgressChartsComponent implements OnInit {
    @Input() username: string;

    faArrowLeft = faArrowLeft;
    faArrowRight = faArrowRight;

    series: any = {};
    currentIndex;

    currentChart: any = {};
    availableCharts: any = [];

    loading: boolean = false;

    currentProgressData: UserProgressChartData;
    cardioCurrentMonthProgressData: UserProgressChartData;
    compoundProgressData: UserProgressChartData;
    isolatedProgressData: UserProgressChartData;
    weightData: UserProgressChartData;
    bioData: UserProgressChartData;
    distanceMonthData: UserProgressChartData;
    distanceMonthComparisonData: UserProgressChartData;

    availableChartData = new UserAvailableChartData();

    UserProgressChartType = UserProgressChartType;

    date_gte: Date;
    date_lte: Date;
    last_number_of_months: number = 6;

    workouts: Workout[] = [];

    constructor(
        private userProgressService: UserProgressService,
        private loadingService: LoadingService,
        private workoutsService: WorkoutsService,
        private unitsService: UnitsService,
    ) { }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.username) {
            this.currentIndex = 0;
            this.date_lte = new Date();
            this.date_gte = new Date(this.date_lte.valueOf() - this.unitsService.monthInMilliseconds * (this.last_number_of_months + 1));

            this.currentChart = null;
            this.workouts = [];
            this.series = [];
            this.availableCharts = [];
            this.availableChartData = new UserAvailableChartData();

            this.loadingService.load();
            this.loading = true;
            this.workoutsService.getAvailableChartData(this.username, this.date_gte, this.date_lte)
            .subscribe(a => {
                this.availableChartData = a;

                if (a.has_compound_exercises) {
                    this.availableCharts.push( {name: 'Compound exercises', chartType: ChartCategory.Compound });
                }

                if (a.has_isolation_exercises) {
                    this.availableCharts.push( { name: 'Isolation exercises', chartType: ChartCategory.Isolated });
                }

                if (a.has_distance_exercises) {
                    const name = "Distance - " + (new Date()).toLocaleString('en-GB', { month: 'long' });
                    this.availableCharts.push( { name, chartType: ChartCategory.DistanceMonth });
                }

                if (a.has_weight_records) {
                    this.availableCharts.push( {name: 'Weight', chartType: ChartCategory.Weight });
                }

                if (a.has_bio_data_records) {
                    this.availableCharts.push({name: 'Body composition', chartType: ChartCategory.BioData });
                }

                if (this.availableCharts.length > 0) {
                    this.currentChart = this.availableCharts[0];
                    this.loadChartByType(this.currentChart.chartType);
                }

                this.loadingService.unload();
                this.loading = false;
            });
        }
    }

    loadChartByType(t: ChartCategory) {
        switch (t) {
            case ChartCategory.BioData:
                this.loadUserBioDataChart();
                break;
            case ChartCategory.Weight:
                this.loadWeightChart();
                break;
            case ChartCategory.DistanceMonth:
                this.loadDistanceMonthChart();
                break;
            case ChartCategory.DistanceMonthsComparison:
                this.loadDistanceMonthComparisonChart();
                break;
            case ChartCategory.Isolated:
                this.loadIsolatedCharts();
                break;
            case ChartCategory.Compound:
                this.loadCompoundCharts();
                break;
        }
    }

    loadDistanceMonthComparisonChart() {
        if (this.distanceMonthComparisonData) {
            this.currentProgressData = this.distanceMonthComparisonData;
            return;
        }

        this.loadingService.load();

        let workoutObservable: Observable<Workout[]>;

        if (this.workouts && this.workouts.length > 0) {
            workoutObservable = of(this.workouts);
        }
        else {
            workoutObservable = this.workoutsService.getWorkoutsByDate(this.username, this.date_gte, this.date_lte);
        }

        workoutObservable.subscribe(workouts => {
            this.userProgressService.getDistanceMonthComparisonProgress(workouts).subscribe(p => {
                this.distanceMonthComparisonData = p;
                this.currentProgressData = this.distanceMonthComparisonData;

                this.loadingService.unload();
            });
        });
    }

    loadDistanceMonthChart() {
        if (this.distanceMonthData) {
            this.currentProgressData = this.distanceMonthData;
            return;
        }

        this.loadingService.load();

        let workoutObservable: Observable<Workout[]>;

        if (this.workouts && this.workouts.length > 0) {
            workoutObservable = of(this.workouts);
        }
        else {
            workoutObservable = this.workoutsService.getWorkoutsByDate(this.username, this.date_gte, this.date_lte);
        }

        workoutObservable.subscribe(workouts => {
            this.userProgressService.getDistanceMonthProgress(workouts, new Date()).subscribe(p => {
                this.distanceMonthData = p;
                this.currentProgressData = this.distanceMonthData;

                this.loadingService.unload();
            });
        });
    }
    
    loadIsolatedCharts() {
        if (this.isolatedProgressData) {
            this.currentProgressData = this.isolatedProgressData;
            return;
        }

        this.loadingService.load();

        let workoutObservable: Observable<Workout[]>;

        if (this.workouts && this.workouts.length > 0) {
            workoutObservable = of(this.workouts);
        }
        else {
            workoutObservable = this.workoutsService.getWorkoutsByDate(this.username, this.date_gte, this.date_lte);
        }

        workoutObservable.subscribe(workouts => {
            this.userProgressService.getUserStrengthProgress(workouts).subscribe(p => {
                this.isolatedProgressData = this.getProgressDataByMechanics('Isolation exercises', p, Mechanics.Isolated);
                this.isolatedProgressData.category = ChartCategory.Isolated;
                this.currentProgressData = this.isolatedProgressData;

                this.loadingService.unload();
            });
        });
    }

    loadCompoundCharts() {
        if (this.compoundProgressData) {
            this.currentProgressData = this.compoundProgressData;
            return;
        }

        this.loadingService.load();

        let workoutObservable: Observable<Workout[]>;

        if (this.workouts && this.workouts.length > 0) {
            workoutObservable = of(this.workouts);
        }
        else {
            workoutObservable = this.workoutsService.getWorkoutsByDate(this.username, this.date_gte, this.date_lte);
        }

        workoutObservable.subscribe(workouts => {
            this.userProgressService.getUserStrengthProgress(workouts).subscribe(p => {
                this.compoundProgressData = this.getProgressDataByMechanics('Compound exercises', p, Mechanics.Compound);
                this.compoundProgressData.category = ChartCategory.Compound;
                this.currentProgressData = this.compoundProgressData;

                this.loadingService.unload();
            });
        });
    }

    loadWeightChart() {
        if (this.weightData) {
            this.currentProgressData = this.weightData;
            return;
        }

        this.loadingService.load();

        this.userProgressService.getUserWeightData(this.username, this.date_gte, this.date_lte).subscribe(p => {
            if (p && p.series && p.series.length > 0 && p.series[0].dataPoints && p.series[0].dataPoints.length > 0) {
                this.weightData = p;
                this.currentProgressData = this.weightData;
            }

            this.loadingService.unload();
        });
    }

    loadUserBioDataChart() {
        if (this.bioData) {
            this.currentProgressData = this.bioData;
            return;
        }

        this.loadingService.load();

        this.userProgressService.getUserBioDataProgress(this.username).pipe(tap(next => { }, error => { }, () => this.loading = false)).subscribe(p => {
            this.bioData = p;
            this.currentProgressData = this.bioData;

            this.loadingService.unload();
        });
    }

    previous() {
        this.currentIndex--;

        if (this.currentIndex < 0) {
            this.currentIndex = this.availableCharts.length - 1;
        }

        this.currentChart = this.availableCharts[this.currentIndex];
        this.currentProgressData = null;
        this.loadChartByType(this.currentChart.chartType);
    }

    next() {
        this.currentIndex++;

        if (this.currentIndex >= this.availableCharts.length) {
            this.currentIndex = 0;
        }

        this.currentChart = this.availableCharts[this.currentIndex];
        this.currentProgressData = null;
        this.loadChartByType(this.currentChart.chartType);
    }

    getProgressDataByMechanics(n: string, pd: UserProgressData, mechanics: Mechanics) {
        const npd = new UserProgressChartData();

        npd.name = n;
        npd.unitCode = pd.unitCode;
        npd.series = pd.series.filter(x => x.exercise.mechanics == mechanics).map(x => new UserProgressChartSeries(x.exercise.short_name, x.dataPoints.map(y => new UserProgressChartDataPoint(x.exercise.short_name, y.weight, y.date))));
        npd.dates = [... new Set(npd.series.flatMap(x => x.dataPoints.map(y => y.date)))];

        return npd;
    }
}