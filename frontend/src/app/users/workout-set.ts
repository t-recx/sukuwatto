import { RepetitionType } from './plan-session-group-activity';
import { Exercise } from './exercise';

export class WorkoutSet {
    id: number;
    start: Date;
    end: Date;
    exercise: Exercise;
    repetition_type: RepetitionType;
    expected_number_of_repetitions: number;
    expected_number_of_repetitions_up_to: number;
    number_of_repetitions: number;
    weight: number;
    unit: number;
    unit_code: string;
    in_progress: boolean;
    done: boolean;
    order: number;
    plan_session_group_activity: number;
    working_parameter_percentage: number;

    constructor(init?: Partial<WorkoutSet>) {
        this.exercise = new Exercise();
        Object.assign(this, init);
    }
}