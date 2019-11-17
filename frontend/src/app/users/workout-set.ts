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
    done: boolean;
}