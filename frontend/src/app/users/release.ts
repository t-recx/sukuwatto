import { User } from '../user';
import { Feature } from './feature';

export enum ReleaseState {
    InProgress = 'p',
    Done = 'd',
}

export const ReleaseStateLabel = new Map<string, string>([
  [ReleaseState.InProgress, 'In progress'],
  [ReleaseState.Done, 'Done'],
]);

export class Release {
    id: number;
    version: string;
    description: string;
    date: Date;
    deploy_date: Date;
    features: Feature[];
    state: ReleaseState;
    likes: number;
    comment_number: number;
    user: User;

    constructor() {
        this.features = [];
    }
}
