import { WorkoutSet } from './workout-set';

export class WorkoutGroup {
    order: number;
    name: string;
    plan_session_group: number;
    sets: WorkoutSet[];
    warmups: WorkoutSet[];

    constructor() {
        this.sets = [];
        this.warmups = [];
    }
}
