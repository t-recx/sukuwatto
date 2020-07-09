import { RepetitionType, SpeedType, Vo2MaxType, DistanceType, TimeType } from './plan-session-group-activity';
import { Exercise } from './exercise';
import { WorkoutSetPosition } from './workout-set-position';
import { GeoTrackingType, GeoView } from './workout-set-geolocation/workout-set-geolocation.component';
import { LatLng, latLng } from 'leaflet';
import { WorkoutSetTimeSegment } from './workout-set-time-segment';

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
    expected_weight: number;
    weight_unit: number;
    plan_weight_unit: number;
    in_progress: boolean;
    done: boolean;
    order: number;
    plan_session_group_activity: number;
    working_weight_percentage: number;

    tracking: boolean;
    positions: WorkoutSetPosition[];
    segments: WorkoutSetTimeSegment[];

    speed_type: SpeedType;
    expected_speed: number;
    expected_speed_up_to: number;
    speed: number;
    speed_unit: number;
    plan_speed_unit: number;

    vo2max_type: Vo2MaxType;
    expected_vo2max: number;
    expected_vo2max_up_to: number;
    vo2max: number;

    distance_type: DistanceType;
    expected_distance: number;
    expected_distance_up_to: number;
    distance: number;
    distance_unit: number;
    plan_distance_unit: number;

    time_type: TimeType;
    expected_time: number;
    expected_time_up_to: number;
    time: number;
    time_unit: number;
    plan_time_unit: number;

    working_time_percentage: number;
    working_distance_percentage: number;
    working_speed_percentage: number;

    calories: number;

    met: number;
    met_set_by_user: boolean;

    // not stored, but helpful to restore state
    // when geolocation is used:
    maximized: boolean = false;
    trackingType: GeoTrackingType = GeoTrackingType.None;
    collectingPositions: boolean = false;
    zoom: number = 8;
    center: LatLng = latLng(0, 0);
    userOperatingMap: boolean = false;
    watchId: number = null;
    ellapsedTime: string;
    caloriesDetailed: boolean = false;
    currentView: GeoView = GeoView.Map;
    suspended: boolean = false;
    // ----

    constructor(init?: Partial<WorkoutSet>) {
        this.exercise = new Exercise();
        Object.assign(this, init);
    }
}