export enum MeasurementSystem {
    Metric = 'm',
    Imperial = 'i',
}

export const MeasurementSystemLabel = new Map<string, string>([
  [MeasurementSystem.Metric, 'Metric'],
  [MeasurementSystem.Imperial, 'Imperial'],
]);

export enum Gender {
    Male = 'm',
    Female = 'f',
    NonBinary = 'n',
}

export class User {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    password: string;
    location: string;
    email: string;
    gender: Gender;
    year_birth: number;
    month_birth: number;
    biography: string;
    default_weight_unit: number;
    default_speed_unit: number;
    default_distance_unit: number;
    system: MeasurementSystem;
    profile_filename: string;
    is_staff: boolean;

    constructor(init?: Partial<User>) {
        Object.assign(this, init);
    }
}
