import { RepetitionType } from './plan-session-group-activity';
import { Exercise } from './exercise';

export class WorkoutOverview {
    number_of_sets: number; 
    number_of_repetitions: number;
    exercise: Exercise;
    repetition_type: RepetitionType;
    weight: number;
    unit: number;
}