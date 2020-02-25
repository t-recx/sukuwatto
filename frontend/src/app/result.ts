export class Result<T> {
    success: boolean;
    field: string;
    code: string;
    message: string;
    object: T;

    constructor(
        { success = true, field = null, code = null, message = null, object = null }: 
        { success?: boolean; field?: string; code?: string; message?: string; object?: T; } = {}) {
        this.success = success;
        this.field = field;
        this.code = code;
        this.message = message;
        this.object = object;
    }
}

export class Results<T> {
    results: Result<T>[];

    constructor() {
        this.results = [];
    }

    success(): boolean {
        return !this.failed();
    }

    failed(): boolean {
        return this.results.some(x => !x.success);
    }

    push(result: Result<T>) {
        this.results.push(result);
    }

    getFailedFields(): {} {
        const fields = {};

        this.results.filter(x => !x.success).forEach(element => {
            fields[element.field] = element.message;
        });

        return fields;
    }
}
