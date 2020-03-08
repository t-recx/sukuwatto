export class DataTablesParameters {
    columns: DataTablesParametersColumn[];
    draw: number;
    order: DataTablesParametersOrder[]
    start: number;
    length: number;
    search: DataTablesParametersSearch;
}

export class DataTablesParametersOrder {
    column: number;
    dir: string;
}

export class DataTablesParametersSearch {
    value: string;
    regex: boolean;
}

export class DataTablesParametersColumn {
    data: string;
    name: string;
    searchable: boolean;
    orderable: boolean;
    search: DataTablesParametersSearch;
}