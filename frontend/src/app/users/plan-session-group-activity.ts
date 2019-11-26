export enum ActivityType {
    Exercise,
    WarmUp,
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
    working_weight_percentage: number;
    exercise: number;
}