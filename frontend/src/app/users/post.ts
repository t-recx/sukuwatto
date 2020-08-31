import { User } from '../user';
import { PostImage } from './post-image';

export class Post {
    id: number;
    title: string;
    text: string;
    date: Date;
    edited_date: Date;
    user: User;
    likes: number;
    comment_number: number;
    post_images: PostImage[];
}