import { WorkoutGroup } from './workout-group';

export class Workout {
    id: number;
    start: Date;
    end: Date;
    name: string;
    notes: string;
    plan: number;
    plan_session: number;
    groups: WorkoutGroup[];

    constructor() {
        this.groups = [];
    }
}