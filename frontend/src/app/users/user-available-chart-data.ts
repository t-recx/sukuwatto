export class UserAvailableChartData {
    has_compound_exercises: boolean;
    has_isolation_exercises: boolean;
    has_distance_exercises_last_month: boolean;
    has_weight_records: boolean;
    has_bio_data_records: boolean;
    has_distance_exercises: boolean;
}

export class UserVisibleChartData {
    show_compound_exercises: boolean;
    show_isolation_exercises: boolean;
    show_distance_exercises_last_month: boolean;
    show_weight_records: boolean;
    show_bio_data_records: boolean;
    show_distance_exercises: boolean;

    constructor(init?: Partial<UserVisibleChartData>) {
        Object.assign(this, init);
    }
}