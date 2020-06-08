import { RepetitionType, SpeedType, Vo2MaxType, DistanceType, TimeType } from './plan-session-group-activity';
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
    working_weight_percentage: number;

    speed_type: SpeedType;
    expected_speed: number;
    expected_speed_up_to: number;
    speed: number;
    speed_unit: number;
    speed_unit_code: string;

    vo2max_type: Vo2MaxType;
    expected_vo2max: number;
    expected_vo2max_up_to: number;
    vo2max: number;

    distance_type: DistanceType;
    expected_distance: number;
    expected_distance_up_to: number;
    distance: number;
    distance_unit: number;
    distance_unit_code: string;

    time_type: TimeType;
    expected_time: number;
    expected_time_up_to: number;
    time: number;
    time_unit: number;
    time_unit_code: string;

    working_time_percentage: number;
    working_distance_percentage: number;
    working_speed_percentage: number;

    constructor(init?: Partial<WorkoutSet>) {
        this.exercise = new Exercise();
        Object.assign(this, init);
    }
}