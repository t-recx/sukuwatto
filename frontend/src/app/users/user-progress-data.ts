import { Exercise } from './exercise';

export class UserProgressData{
    name: string;
    series: UserProgressSeries[];
    dates: Date[];
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

    constructor (ex: Exercise, w: number, d: Date) {
        this.exercise = ex;
        this.weight = w;
        this.date = new Date(d);
    }
}
