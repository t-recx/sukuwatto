import { Exercise } from './exercise';

export class UserProgressData{
    name: string;
    series: UserProgressSeries[];
    dates: Date[];
    unitCode: string;
}

export class UserProgressSeries {
    exercise: Exercise;
    dataPoints: UserProgressDataPoint[];

    constructor(ex: Exercise, dp: UserProgressDataPoint[]) {
        this.exercise = ex;
        this.dataPoints = dp;
    }
}

export class UserProgressDataPoint {
    exercise: Exercise;
    weight: number;
    date: Date;
    unit: number;

    constructor (ex: Exercise, w: number, d: Date, u: number) {
        this.exercise = ex;
        this.weight = w;
        this.date = new Date(d);
        this.unit = u;
    }
}
