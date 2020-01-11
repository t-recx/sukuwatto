import { User } from '../user';
import { Message } from './message';

export class LastMessage {
    date: Date;
    user: User;
    correspondent: User;
    last_read_message: Message;
    last_message: Message;
    unread_count: number;

    constructor() {
    }
}