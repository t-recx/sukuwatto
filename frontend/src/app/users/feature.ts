import { User } from '../user';
import { FeatureImage } from './feature-image';

export class Feature {
    id: number;
    title: string;
    text: string;
    date: Date;
    edited_date: Date;
    user: User;
    likes: number;
    comment_number: number;
    feature_images: FeatureImage[];
}