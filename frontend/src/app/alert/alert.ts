export class Alert {
    id: string;
    message: string;
    type: AlertType;

    constructor(init?: Partial<Alert>) {
        Object.assign(this, init);
    }
}

export enum AlertType {
    Success,
    Warning,
    Error,
    Info
}