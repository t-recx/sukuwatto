import { WorkoutSet } from './workout-set';

export class WorkoutGroup {
    order: number;
    name: string;
    sets: WorkoutSet[];
    warmups: WorkoutSet[];

    constructor() {
        this.sets = [];
        this.warmups = [];
    }
}
