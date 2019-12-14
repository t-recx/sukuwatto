import { RepetitionType } from './plan-session-group-activity';

export class WorkoutActivityResumed {
    number_of_sets: number; 
    number_of_repetitions: number;
    exercise: number;
    repetition_type: RepetitionType;
    weight: number;
    unit: number;
}