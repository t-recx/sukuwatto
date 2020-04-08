import { WorkoutSet } from './workout-set';

export class WorkoutGroup {
    order: number;
    name: string;
    plan_session_group: number;
    sets: WorkoutSet[];
    warmups: WorkoutSet[];

    constructor(init? : Partial<WorkoutGroup>) {
        this.sets = [];
        this.warmups = [];

        Object.assign(this, init);
    }
}
