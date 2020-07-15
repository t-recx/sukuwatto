export class Message {
    uuid: string;
    date: Date;
    from_user: number;
    to_user: number;
    message: string;
    server_received: boolean;

    constructor() {
    }
}