import { User } from '../user';

export class Comment {
    id: number;
    title: string;
    text: string;

    comment_target_content_type: any;
    comment_target_object_id: string;

    target_plan: number;
    target_exercise: number;
    target_workout: number;
    target_post: number;

    date: Date;
    user: User;
}
