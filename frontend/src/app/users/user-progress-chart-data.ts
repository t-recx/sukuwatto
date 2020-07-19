import { ChartCategory as ChartCategory } from './chart-category';

export enum UserProgressChartType {
    Line = 1,
    Pie = 2,
    Area = 3,
}

export class UserProgressChartData{
    name: string;
    category: ChartCategory;
    unitCode: string;
    series: UserProgressChartSeries[];
    dates: Date[];
    type: UserProgressChartType;

    constructor() {
        this.type = UserProgressChartType.Line;
    }
}

export class UserProgressChartSeries {
    name: string;
    dataPoints: UserProgressChartDataPoint[];

    constructor(name: string, dp: UserProgressChartDataPoint[]) {
        this.name = name;
        this.dataPoints = dp;
    }
}

export class UserProgressChartDataPoint {
    name: string;
    value: number;
    date: Date;

    constructor (name: string, w: number, d: Date) {
        this.name = name;
        this.value = w;
        this.date = new Date(d);
    }
}

