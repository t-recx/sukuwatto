export class WorkoutSetPosition {
    accuracy: number;
    altitude: number | null;
    heading: number | null;
    latitude: number;
    longitude: number;
    speed: number | null;
    timestamp: number; 

    constructor(init?: Partial<WorkoutSetPosition>) {
        Object.assign(this, init);
    }
}
