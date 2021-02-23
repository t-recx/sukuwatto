export class ChartDistanceMonth {
    distance: number;
    distance_unit: number;
    date: Date;
    exercise_name: string;

    constructor(init?: Partial<ChartDistanceMonth>) {
        Object.assign(this, init);
    }
}