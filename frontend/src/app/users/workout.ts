import { WorkoutGroup } from './workout-group';
import { WorkingWeight } from './working-weight';

export class Workout {
    id: number;
    start: Date;
    end: Date;
    name: string;
    notes: string;
    plan: number;
    plan_session: number;
    groups: WorkoutGroup[];
    working_weights: WorkingWeight[];

    constructor() {
        this.groups = [];
        this.working_weights = [];
    }
}