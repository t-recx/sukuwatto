import { User } from '../user';

export class Message {
    date: Date;
    from_user: User;
    to_user: User;
    message: string;

    constructor() {
    }
}