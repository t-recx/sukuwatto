import { WorkoutGroup } from './workout-group';
import { WorkingParameter } from './working-parameter';
import { User } from '../user';
import { Visibility } from '../visibility';

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
    working_parameters: WorkingParameter[];
    user: User;
    status: WorkoutStatus;
    visibility: Visibility;

    calories: number;
    likes: number;
    comment_number: number;

    constructor(init?: Partial<Workout>) {
        this.groups = [];
        this.working_parameters = [];
        this.status = WorkoutStatus.InProgress;

        Object.assign(this, init);
    }
}