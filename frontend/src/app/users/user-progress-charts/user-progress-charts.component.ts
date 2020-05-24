import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { UserProgressService } from '../user-progress.service';
import { Mechanics } from '../exercise';
import { UserProgressData } from '../user-progress-data';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { UserProgressChartData, UserProgressChartSeries, UserProgressChartDataPoint } from '../user-progress-chart-data';

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

    currentProgressData: UserProgressChartData;
    progressData: UserProgressData;
    compoundProgressData: UserProgressChartData;
    isolatedProgressData: UserProgressChartData;
    weightData: UserProgressChartData;

    constructor(
        private userProgressService: UserProgressService,
    ) { }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.username) {
            this.loadData();
        }
    }

    loadData() {
        this.userProgressService.getUserProgress(this.username).subscribe(p => {
            this.currentIndex = 0;
            this.series = [];

            this.progressData = p;
            this.compoundProgressData = this.getProgressDataByMechanics('Compound exercises', this.progressData, Mechanics.Compound);
            this.isolatedProgressData = this.getProgressDataByMechanics('Isolation exercises', this.progressData, Mechanics.Isolated);

            if (this.compoundProgressData.series.length > 0) {
                this.series.push(this.compoundProgressData); 
            }

            if (this.isolatedProgressData.series.length > 0) {
                this.series.push(this.isolatedProgressData); 
            }

            this.currentProgressData = this.series[this.currentIndex];

            this.userProgressService.getUserWeightData(this.username).subscribe(p => {
                if (p && p.series && p.series.length > 0 && p.series[0].dataPoints && p.series[0].dataPoints.length > 0) {
                    this.series.push(p); 
                }
            })
        });
    }

    previous() {
        this.currentIndex--;

        if (this.currentIndex < 0) {
            this.currentIndex = this.series.length - 1;
        }

        this.currentProgressData = this.series[this.currentIndex];
    }

    next() {
        this.currentIndex++;

        if (this.currentIndex >= this.series.length) {
            this.currentIndex = 0;
        }

        this.currentProgressData = this.series[this.currentIndex];
    }

    getProgressDataByMechanics(n: string, pd: UserProgressData, mechanics: Mechanics) {
        const npd = new UserProgressChartData();

        npd.name = n;
        npd.series = pd.series.filter(x => x.exercise.mechanics == mechanics).map(x => new UserProgressChartSeries(x.exercise.short_name, x.dataPoints.map(y => new UserProgressChartDataPoint(x.exercise.short_name, y.weight, y.date))));
        npd.dates = [... new Set(npd.series.flatMap(x => x.dataPoints.map(y => y.date)))];

        return npd;
    }
}
