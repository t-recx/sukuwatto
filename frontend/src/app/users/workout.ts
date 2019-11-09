import { WorkoutSet } from './workout-set';

export class Workout {
    id: number;
    start: Date;
    end: Date;
    plan_session: number;
    sets: WorkoutSet[];

    constructor() {
        this.sets = [];
    }
}