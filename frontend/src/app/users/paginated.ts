export class Paginated<T> {
    count: number;
    next: string;
    previous: string;
    results: T[];

    constructor() {
        this.results = [];
    }
}