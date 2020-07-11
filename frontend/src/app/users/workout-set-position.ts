export class WorkoutSetPosition {
    id: number;
    accuracy: number;
    altitude: number | null;
    heading: number | null;
    latitude: number;
    longitude: number;
    speed: number | null;
    timestamp: number; 

    sortIndex: number;

    constructor(init?: Partial<WorkoutSetPosition>) {
        Object.assign(this, init);
    }
}
