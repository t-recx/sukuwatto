export class Paginated<T> {
    count: number;
    next: string;
    previous: string;
    results: T[];

    constructor(init: Partial<Paginated<T>> = null) {
        this.results = [];

        if (init) {
            Object.assign(this, init);
        }
    }
}