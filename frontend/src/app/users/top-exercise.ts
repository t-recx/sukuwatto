export class TopExercise {
    name: string;
    count: number;

    constructor(init?: Partial<TopExercise>) {
        Object.assign(this, init);
    }
}
