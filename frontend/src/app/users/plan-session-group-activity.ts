export enum ActivityType {
    Exercise,
    WarmUp,
}

export class PlanSessionGroupActivity {
    id: number;
    order: number;
    number_of_sets: number;
    number_of_repetitions: number;
    number_of_repetitions_up_to: number;
    working_weight_percentage: number;
    exercise: string;
}