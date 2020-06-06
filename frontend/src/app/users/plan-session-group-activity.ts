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

export class PlanSessionGroupActivity {
    id: number;
    order: number;
    number_of_sets: number;
    repetition_type: RepetitionType;
    number_of_repetitions: number;
    number_of_repetitions_up_to: number;
    working_parameter_percentage: number;
    exercise: Exercise;

    constructor(init?: Partial<PlanSessionGroupActivity>) {
        Object.assign(this, init);
    }
}
