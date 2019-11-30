export enum MeasurementSystem {
    Metric = 'm',
    Imperial = 'i',
}

export const MeasurementSystemLabel = new Map<string, string>([
  [MeasurementSystem.Metric, 'Metric'],
  [MeasurementSystem.Imperial, 'Imperial'],
]);

export class Unit {
    id: number;
    name: string;
    abbreviation: string;
    system: MeasurementSystem;
}