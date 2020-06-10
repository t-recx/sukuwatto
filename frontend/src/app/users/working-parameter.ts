import { Exercise } from './exercise';
import { ParameterType } from './plan-progression-strategy';

export class WorkingParameter {
    id: number;
    exercise: Exercise;
    parameter_value: number;
    parameter_type: ParameterType;
    unit: number;
    previous_parameter_value: number;
    previous_unit: number;
    manually_changed: boolean;

    constructor(init?: Partial<WorkingParameter>) {
        Object.assign(this, init);
    }
}
