import { MeasurementSystem } from '../user';

export enum MeasurementType {
    Weight = 'w',
    Height = 'h',
}

export const MeasurementTypeLabel = new Map<string, string>([
  [MeasurementType.Weight, 'Weight'],
  [MeasurementType.Height, 'Height'],
]);

export class Unit {
    id: number;
    name: string;
    abbreviation: string;
    system: MeasurementSystem;
    measurement_type: MeasurementType;
}
