import { User } from '../user';
import { FeatureImage } from './feature-image';

export enum FeatureState {
    Open = 'o',
    InProgress = 'p',
    Done = 'd',
    Closed = 'c',
}

export const FeatureStateLabel = new Map<string, string>([
  [FeatureState.Open, 'Open'],
  [FeatureState.InProgress, 'In progress'],
  [FeatureState.Done, 'Done'],
  [FeatureState.Closed, 'Closed'],
]);

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
    state: FeatureState;
    release: number;
}