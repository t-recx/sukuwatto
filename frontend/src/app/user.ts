export enum UnitSystem {
    Metric = 'm',
    Imperial = 'i',
}

export enum Gender {
    Male = 'm',
    Female = 'f',
    NonBinary = 'n',
}

export class User {
    first_name: string;
    last_name: string;
    username: string;
    password: string;
    email: string;
    gender: Gender;
    year_birth: number;
    month_birth: number;
    system: UnitSystem;
}
