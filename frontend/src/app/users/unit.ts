import { MeasurementSystem } from '../user';

export enum MeasurementType {
    Weight = 'w',
    Height = 'h',
    Distance = 'd',
    Time = 't',
}

export const MeasurementTypeLabel = new Map<string, string>([
  [MeasurementType.Weight, 'Weight'],
  [MeasurementType.Height, 'Height'],
  [MeasurementType.Distance, 'Distance'],
  [MeasurementType.Time, 'Time'],
]);

export class Unit {
    id: number;
    name: string;
    abbreviation: string;
    system: MeasurementSystem;
    measurement_type: MeasurementType;

    constructor(init?: Partial<Unit>) {
        Object.assign(this, init);
    }
}
