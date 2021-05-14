import { Section, Modality, Force, Mechanics, Exercise } from './exercise';

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
    parameter_type: ParameterType;
    initial_value: number;
    parameter_increase: number;
    percentage_increase: number;
    unit: number;
    progression_type: ProgressionType;
    exercise: Exercise;
    section: Section;
    modality: Modality;
    force: Force;
    mechanics: Mechanics;
    collapsed: boolean;

    validations: {};

    constructor(init?: Partial<ProgressionStrategy>) {
        Object.assign(this, init);
    }
}