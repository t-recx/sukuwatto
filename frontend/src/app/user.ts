import { Visibility } from './visibility';

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
    default_visibility_workouts: Visibility;
    default_visibility_user_bio_datas: Visibility;
    system: MeasurementSystem;
    profile_filename: string;
    is_staff: boolean;
    follow_approval_required: boolean;
    visibility: Visibility;
    hidden: boolean;

    constructor(init?: Partial<User>) {
        Object.assign(this, init);
    }
}
