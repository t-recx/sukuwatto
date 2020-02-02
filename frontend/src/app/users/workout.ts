import { WorkoutGroup } from './workout-group';
import { WorkingWeight } from './working-weight';
import { User } from '../user';

export enum WorkoutStatus {
    InProgress = 'p',
    Finished = 'f',
}

export const WorkoutStatusLabel = new Map<string, string>([
  [WorkoutStatus.InProgress, 'In progress'],
  [WorkoutStatus.Finished, 'Finished'],
]);

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
    user: User;
    status: WorkoutStatus;

    constructor() {
        this.groups = [];
        this.working_weights = [];
        this.status = WorkoutStatus.InProgress;
    }
}