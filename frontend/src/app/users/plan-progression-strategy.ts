import { Section, Modality, Force, Mechanics, Exercise } from './exercise';
import { PlanProgressionStrategiesComponent } from './plan-progression-strategies/plan-progression-strategies.component';

export enum ProgressionType {
    ByExercise = 'e',
    ByCharacteristics = 'c',
}

export const ProgressionTypeLabel = new Map<string, string>([
  [ProgressionType.ByExercise, 'By Exercise'],
  [ProgressionType.ByCharacteristics, 'By Characteristics'],
]);

export class ProgressionStrategy {
    id: number;
    weight_increase: number;
    percentage_increase: number;
    unit: number;
    unit_code: string;
    progression_type: ProgressionType;
    exercise: Exercise;
    section: Section;
    modality: Modality;
    force: Force;
    mechanics: Mechanics;

    validations: {};

    constructor(init?: Partial<ProgressionStrategy>) {
        Object.assign(this, init);
    }
}