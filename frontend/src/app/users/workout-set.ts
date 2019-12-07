import { RepetitionType } from './plan-session-group-activity';

export class WorkoutSet {
    id: number;
    start: Date;
    end: Date;
    exercise: number;
    repetition_type: RepetitionType;
    expected_number_of_repetitions: number;
    expected_number_of_repetitions_up_to: number;
    number_of_repetitions: number;
    weight: number;
    unit: number;
    in_progress: boolean;
    done: boolean;
    order: number;
    plan_session_group_activity: number;
    working_weight_percentage: number;
}