import { Exercise } from './exercise';
import { ParameterType } from './plan-progression-strategy';

export class WorkingParameter {
    id: number;
    exercise: Exercise;
    parameter_value: number;
    parameter_type: ParameterType;
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
