import { Exercise } from './exercise';

export enum ActivityType {
    Exercise,
    WarmUp,
}

export enum PlanActivityTab {
    Exercise,
    WarmUp,
    Progressions
}

export enum RepetitionType {
    Standard = 's',
    Range = 'r',
    ToFailure = 'f',
    AMRAP = 'a',
    None = 'n',
}

export const RepetitionTypeLabel = new Map<string, string>([
  [RepetitionType.Standard, 'Standard'],
  [RepetitionType.Range, 'Range'],
  [RepetitionType.ToFailure, 'To Failure'],
  [RepetitionType.AMRAP, 'AMRAP'],
  [RepetitionType.None, 'None'],
]);

export enum SpeedType {
    None = 'n',
    Standard = 's',
    Range = 'r',
    AFAP = 'a',
    Parameter = 'p'
}

export const SpeedTypeLabel = new Map<string, string>([
  [SpeedType.None, 'None'],
  [SpeedType.Standard, 'Standard'],
  [SpeedType.Range, 'Range'],
  [SpeedType.AFAP, 'As fast as possible'],
  [SpeedType.Parameter, 'Parameterized'],
]);

export enum Vo2MaxType {
    None = 'n',
    Standard = 's',
    Range = 'r',
}

export const Vo2MaxTypeLabel = new Map<string, string>([
  [Vo2MaxType.None, 'None'],
  [Vo2MaxType.Standard, 'Standard'],
  [Vo2MaxType.Range, 'Range'],
]);

export enum DistanceType {
    None = 'n',
    Standard = 's',
    Range = 'r',
    Parameter = 'p'
}

export const DistanceTypeLabel = new Map<string, string>([
  [DistanceType.None, 'None'],
  [DistanceType.Standard, 'Standard'],
  [DistanceType.Range, 'Range'],
  [DistanceType.Parameter, 'Parameterized'],
]);

export enum TimeType {
    None = 'n',
    Standard = 's',
    Range = 'r',
    Parameter = 'p'
}

export const TimeTypeLabel = new Map<string, string>([
  [TimeType.None, 'None'],
  [TimeType.Standard, 'Standard'],
  [TimeType.Range, 'Range'],
  [TimeType.Parameter, 'Parameterized'],
]);

export class PlanSessionGroupActivity {
    id: number;
    order: number;
    number_of_sets: number;
    repetition_type: RepetitionType;
    number_of_repetitions: number;
    number_of_repetitions_up_to: number;

    speed_type: SpeedType;
    speed: number;
    speed_up_to: number;
    speed_unit: number;

    distance_type: DistanceType;
    distance: number;
    distance_up_to: number;
    distance_unit: number;

    time_type: TimeType;
    time: number;
    time_up_to: number;
    time_unit: number;

    vo2max_type: Vo2MaxType;
    vo2max: number;
    vo2max_up_to: number;

    exercise: Exercise;

    working_weight_percentage: number;
    working_distance_percentage: number;
    working_time_percentage: number;
    working_speed_percentage: number;

    collapsed: boolean;

    constructor(init?: Partial<PlanSessionGroupActivity>) {
        Object.assign(this, init);
    }
}
