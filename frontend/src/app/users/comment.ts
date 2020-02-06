import { User } from '../user';

export class Comment {
    id: number;
    title: string;
    text: string;

    comment_target_content_type: any;
    comment_target_object_id: string;

    date: Date;
    user: User;
}
