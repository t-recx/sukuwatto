export class WorkoutSetPosition {
    id: number;
    altitude: number | null;
    latitude: number;
    longitude: number;

    sortIndex: number;

    constructor(init?: Partial<WorkoutSetPosition>) {
        Object.assign(this, init);
    }
}
