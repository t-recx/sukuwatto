export class ChartStrength {
    weight: number;
    weight_unit: number;
    date: Date;
    exercise_name: string;

    constructor(init?: Partial<ChartStrength>) {
        Object.assign(this, init);
    }
}