import { Exercise } from './exercise';

export class WorkingWeight {
    id: number;
    exercise: Exercise;
    weight: number;
    unit: number;
    unit_code: string;
    previous_weight: number;
    previous_unit: number;
}
