import { Exercise } from './exercise';

export class WorkingParameter {
    id: number;
    exercise: Exercise;
    parameter_value: number;
    unit: number;
    unit_code: string;
    previous_parameter_value: number;
    previous_unit: number;
    previous_unit_code: string;
    manually_changed: boolean;

    constructor(init?: Partial<WorkingParameter>) {
        Object.assign(this, init);
    }
}
