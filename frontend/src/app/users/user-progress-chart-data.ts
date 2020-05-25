export enum UserProgressChartType {
    Line = 1,
    Pie = 2,
}

export class UserProgressChartData{
    name: string;
    series: UserProgressChartSeries[];
    dates: Date[];
    type: UserProgressChartType;

    constructor() {
        this.type = UserProgressChartType.Line;
    }
}

export class UserProgressChartSeries {
    name: string
    dataPoints: UserProgressChartDataPoint[];

    constructor(name: string, dp: UserProgressChartDataPoint[]) {
        this.name = name;
        this.dataPoints = dp;
    }
}

export class UserProgressChartDataPoint {
    name: string;
    weight: number;
    date: Date;

    constructor (name: string, w: number, d: Date) {
        this.name = name;
        this.weight = w;
        this.date = new Date(d);
    }
}

