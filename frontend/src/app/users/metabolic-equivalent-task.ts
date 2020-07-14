import { ExerciseType, Section, Modality, Force, Mechanics } from './exercise';

export class MetabolicEquivalentTask {
    id: number;
    code: string;
    description: string;

    exercise: number;
    exercise_type: ExerciseType;
    section: Section;
    modality: Modality;
    force: Force;
    mechanics: Mechanics;

    met: number;
    from_value: number;
    to_value: number;
    unit: number;

    can_be_automatically_selected: boolean;
}
