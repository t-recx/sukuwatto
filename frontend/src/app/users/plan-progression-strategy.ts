import { Section, Modality, Force, Mechanics } from './exercise';

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
    progression_type: ProgressionType;
    exercise: number;
    section: Section;
    modality: Modality;
    force: Force;
    mechanics: Mechanics;
}