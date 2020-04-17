import { Exercise } from './exercise';

export class WorkingWeight {
    id: number;
    exercise: Exercise;
    weight: number;
    unit: number;
    unit_code: string;
    previous_weight: number;
    previous_unit: number;
    previous_unit_code: string;

    constructor(init?: Partial<WorkingWeight>) {
        Object.assign(this, init);
    }
}
