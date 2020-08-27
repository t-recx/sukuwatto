import { User } from '../user';

export class Post {
    id: number;
    title: string;
    text: string;
    date: Date;
    edited_date: Date;
    user: User;
    likes: number;
    comment_number: number;
}