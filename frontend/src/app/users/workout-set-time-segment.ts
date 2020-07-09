export class WorkoutSetTimeSegment {
    id: number;
    start: Date;
    end: Date;

    constructor(init?: Partial<WorkoutSetTimeSegment>) {
        Object.assign(this, init);
    }
}

