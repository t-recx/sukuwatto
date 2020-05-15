export class UserProgressData{
    series: UserProgressSeries[];
    dates: Date[];
}

export class UserProgressSeries {
    exercise_name: string;
    dataPoints: UserProgressDataPoint[];

    constructor(n: string, dp: UserProgressDataPoint[]) {
        this.exercise_name = n;
        this.dataPoints = dp;
    }
}

export class UserProgressDataPoint {
    exercise_name: string;
    weight: number;
    date: Date;

    constructor (e: string, w: number, d: Date) {
        this.exercise_name = e;
        this.weight = w;
        this.date = new Date(d);
    }
}