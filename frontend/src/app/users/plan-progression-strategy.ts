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

export enum ParameterType {
    Weight = 'w',
    Distance = 'd',
    Time = 't',
    Speed = 's',
}

export const ParameterTypeLabel = new Map<string, string>([
  [ParameterType.Weight, 'Weight'],
  [ParameterType.Distance, 'Distance'],
  [ParameterType.Time, 'Time'],
  [ParameterType.Speed, 'Speed'],
]);

export class ProgressionStrategy {
    id: number;
    parameter_increase: number;
    parameter_type: ParameterType;
    percentage_increase: number;
    unit: number;
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