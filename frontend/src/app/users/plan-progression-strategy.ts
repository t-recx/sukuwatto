import { Section, Modality, Force, Mechanics } from './exercise';

export class PlanProgressionStrategy {
    id: number;
    exercise: number;
    weight_increase: number;
    percentage_increase: number;
    unit: number;
    section: Section;
    modality: Modality;
    force: Force;
    mechanics: Mechanics;
}