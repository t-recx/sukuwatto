import { User } from '../user';

export class Post {
    id: number;
    title: string;
    text: string;
    date: Date;
    user: User;
}