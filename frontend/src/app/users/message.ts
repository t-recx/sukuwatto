export class Message {
    uuid: string;
    date: Date;
    from_user: number;
    to_user: number;
    message: string;
    unreceived: boolean;

    constructor() {
    }
}