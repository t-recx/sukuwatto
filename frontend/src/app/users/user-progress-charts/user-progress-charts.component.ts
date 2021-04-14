import { Component, OnInit, OnChanges, SimpleChanges, Input, OnDestroy, ElementRef, HostListener, AfterViewInit, AfterViewChecked, AfterContentInit } from '@angular/core';
import { UserProgressService } from '../user-progress.service';
import { Mechanics } from '../exercise';
import { UserProgressData } from '../user-progress-data';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { UserProgressChartData, UserProgressChartSeries, UserProgressChartDataPoint, UserProgressChartType } from '../user-progress-chart-data';
import { tap } from 'rxjs/operators';
import { LoadingService } from '../loading.service';
import { WorkoutsService } from '../workouts.service';
import { UserAvailableChartData, UserVisibleChartData } from '../user-available-chart-data';
import { UnitsService } from '../units.service';
import { Workout } from '../workout';
import { Observable, of, Subscription } from 'rxjs';
import { ChartCategory } from '../chart-category';
import { UserBioDataService } from '../user-bio-data.service';
import { ChartDistanceMonth } from '../chart-distance-month';
import { ChartStrength } from '../chart-strength';

@Component({
    selector: 'app-user-progress-charts',
    templateUrl: './user-progress-charts.component.html',
    styleUrls: ['./user-progress-charts.component.css']
})
export class UserProgressChartsComponent implements OnInit, OnChanges, OnDestroy, AfterViewChecked {
    @Input() username: string;
    @Input() visibleChartData: UserVisibleChartData = null;

    chartWidth: number;
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

    bioDataCreatedSubscription: Subscription;
    bioDataUpdatedSubscription: Subscription;
    bioDataDeletedSubscription: Subscription;

    workoutCreatedSubscription: Subscription;
    workoutUpdatedSubscription: Subscription;
    workoutDeletedSubscription: Subscription;

    constructor(
        private userBioDataService: UserBioDataService,
        private userProgressService: UserProgressService,
        private loadingService: LoadingService,
        private workoutsService: WorkoutsService,
        private unitsService: UnitsService,
        private el: ElementRef,
    ) { }

    ngAfterViewChecked(): void {
        if (!this.chartWidth || this.chartWidth <= 0) {
            this.adjustChartWidth();
        }
    }

    ngOnDestroy(): void {
        this.bioDataCreatedSubscription.unsubscribe();
        this.bioDataUpdatedSubscription.unsubscribe();
        this.bioDataDeletedSubscription.unsubscribe();

        this.workoutCreatedSubscription.unsubscribe();
        this.workoutUpdatedSubscription.unsubscribe();
        this.workoutDeletedSubscription.unsubscribe();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.adjustChartWidth();
    }

    adjustChartWidth() {
        this.chartWidth = this.el.nativeElement.offsetWidth - 30;
    }

    ngOnInit(): void {
        this.bioDataCreatedSubscription = this.userBioDataService.measurementCreated.subscribe(x =>   this.userBioDataUpdated());
        this.bioDataUpdatedSubscription = this.userBioDataService.measurementUpdated.subscribe(x => this.userBioDataUpdated());
        this.bioDataDeletedSubscription = this.userBioDataService.measurementDeleted.subscribe(x => this.userBioDataUpdated());

        this.workoutCreatedSubscription = this.workoutsService.workoutCreated.subscribe(x => this.workoutsUpdated());
        this.workoutUpdatedSubscription = this.workoutsService.workoutUpdated.subscribe(x => this.workoutsUpdated());
        this.workoutDeletedSubscription = this.workoutsService.workoutDeleted.subscribe(x => this.workoutsUpdated());
    }

    userBioDataUpdated() {
        if (this.visibleChartData.show_weight_records ||
            this.visibleChartData.show_bio_data_records) {
            this.loadCharts(true, false);
        }
    }

    workoutsUpdated() {
        if (this.visibleChartData.show_compound_exercises ||
            this.visibleChartData.show_distance_exercises ||
            this.visibleChartData.show_distance_exercises_last_month ||
            this.visibleChartData.show_isolation_exercises) {
            this.loadCharts(true, false);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        this.currentProgressData = null;
        this.loadCharts(true);
    }

    loadCharts(refresh = true, changeCurrentChart = true) {
        this.date_lte = new Date();
        this.date_gte = new Date(this.date_lte.valueOf() - this.unitsService.monthInMilliseconds * (this.last_number_of_months + 1));

        if (changeCurrentChart) {
            this.currentIndex = 0;
            this.currentChart = null;
        }
        this.workouts = [];
        this.series = [];
        this.availableChartData = new UserAvailableChartData();

        this.loadingService.load();
        this.loading = true;
        this.workoutsService.getAvailableChartData(this.username, this.date_gte, this.date_lte)
        .subscribe(a => {
            this.availableChartData = a;

            if (a.has_compound_exercises && (!this.visibleChartData || this.visibleChartData.show_compound_exercises)) {
                if (this.availableCharts.filter(x => x.chartType == ChartCategory.Compound).length == 0) {
                    this.availableCharts.push( {name: 'Compound exercises', chartType: ChartCategory.Compound });
                }
            }
            else {
                this.availableCharts = this.availableCharts.filter(x => x.chartType != ChartCategory.Compound);
            }

            if (a.has_isolation_exercises && (!this.visibleChartData || this.visibleChartData.show_isolation_exercises)) {
                if (this.availableCharts.filter(x => x.chartType == ChartCategory.Isolated).length == 0) {
                    this.availableCharts.push( { name: 'Isolation exercises', chartType: ChartCategory.Isolated });
                }
            }
            else {
                this.availableCharts = this.availableCharts.filter(x => x.chartType != ChartCategory.Isolated);
            }

            if (a.has_distance_exercises_last_month && (!this.visibleChartData || this.visibleChartData.show_distance_exercises_last_month)) {
                if (this.availableCharts.filter(x => x.chartType == ChartCategory.DistanceMonth).length == 0) {
                    const name = "Distance";
                    this.availableCharts.push( { name, chartType: ChartCategory.DistanceMonth, timePeriod: (new Date()).toLocaleString('en-GB', { month: 'long' }) });
                }
            }
            else {
                this.availableCharts = this.availableCharts.filter(x => x.chartType != ChartCategory.DistanceMonth);
            }

            if (a.has_weight_records && (!this.visibleChartData || this.visibleChartData.show_weight_records)) {
                if (this.availableCharts.filter(x => x.chartType == ChartCategory.Weight).length == 0) {
                    this.availableCharts.push( {name: 'Weight', chartType: ChartCategory.Weight });
                }
            }
            else {
                this.availableCharts = this.availableCharts.filter(x => x.chartType != ChartCategory.Weight);
            }

            if (a.has_bio_data_records && (!this.visibleChartData || this.visibleChartData.show_bio_data_records)) {
                if (this.availableCharts.filter(x => x.chartType == ChartCategory.BioData).length == 0) {
                    this.availableCharts.push({name: 'Body composition', chartType: ChartCategory.BioData });
                }
            }
            else {
                this.availableCharts = this.availableCharts.filter(x => x.chartType != ChartCategory.BioData);
            }

            if (this.availableCharts.length > 0) {
                if (changeCurrentChart ||
                    !this.currentChart ||
                    this.availableCharts.filter(x => x.chartType == this.currentChart.chartType).length == 0) {
                    this.currentIndex = 0;
                    this.currentChart = this.availableCharts[0];
                }
                this.loadChartByType(this.currentChart.chartType, refresh);
            }
            else {
                this.currentIndex = 0;
                this.currentChart = null;
            }

            this.loadingService.unload();
            this.loading = false;
        });
    }

    loadChartByType(t: ChartCategory, refresh = true) {
        switch (t) {
            case ChartCategory.BioData:
                this.loadUserBioDataChart(refresh);
                break;
            case ChartCategory.Weight:
                this.loadWeightChart(refresh);
                break;
            case ChartCategory.DistanceMonth:
                this.loadDistanceMonthChart(refresh);
                break;
            case ChartCategory.Isolated:
                this.loadIsolatedCharts(refresh);
                break;
            case ChartCategory.Compound:
                this.loadCompoundCharts(refresh);
                break;
        }
    }

    loadDistanceMonthChart(refresh = false) {
        if (this.distanceMonthData && !refresh) {
            this.currentProgressData = this.distanceMonthData;
            return;
        }

        this.loadingService.load();

        let chartDistanceMonthObservable: Observable<ChartDistanceMonth[]>;


        const startOfMonth = new Date(new Date(this.date_lte.getFullYear(), this.date_lte.getMonth(), 1));
        chartDistanceMonthObservable = this.workoutsService.getChartDistanceMonth(this.username, startOfMonth, this.date_lte);

        chartDistanceMonthObservable.subscribe(data => {
            this.userProgressService.getDistanceMonthProgress(data, new Date()).subscribe(p => {
                this.distanceMonthData = p;
                this.currentProgressData = this.distanceMonthData;

                this.loadingService.unload();
            });
        });
    }
    
    loadIsolatedCharts(refresh = false) {
        if (this.isolatedProgressData && !refresh) {
            this.currentProgressData = this.isolatedProgressData;
            return;
        }

        this.loadingService.load();

        this.userProgressService.getUserChartStrength(this.username, Mechanics.Isolated, this.date_gte, this.date_lte).subscribe(p => {
            this.isolatedProgressData = p;
            this.currentProgressData = this.isolatedProgressData;

            this.loadingService.unload();
        });
    }

    loadCompoundCharts(refresh = false) {
        if (this.compoundProgressData && !refresh) {
            this.currentProgressData = this.compoundProgressData;
            return;
        }

        this.loadingService.load();

        this.userProgressService.getUserChartStrength(this.username, Mechanics.Compound, this.date_gte, this.date_lte).subscribe(p => {
            this.compoundProgressData = p;
            this.currentProgressData = this.compoundProgressData;

            this.loadingService.unload();
        });
    }

    loadWeightChart(refresh = false) {
        if (this.weightData && !refresh) {
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

    loadUserBioDataChart(refresh = false) {
        if (this.bioData && !refresh) {
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
        this.loadChartByType(this.currentChart.chartType, true);
    }

    next() {
        this.currentIndex++;

        if (this.currentIndex >= this.availableCharts.length) {
            this.currentIndex = 0;
        }

        this.currentChart = this.availableCharts[this.currentIndex];
        this.currentProgressData = null;
        this.loadChartByType(this.currentChart.chartType, true);
    }
}