import { User } from './user';

export class Token {
    refresh: string;
    access: string;
    user: User;
}
