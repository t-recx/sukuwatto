import { User } from '../user';

export enum ReportState {
    Open = 'o',
    Closed = 'c',
    Resolved = 'r',
}

export const ReportStateLabel = new Map<string, string>([
  [ReportState.Open, 'Open'],
  [ReportState.Closed, 'Closed'],
  [ReportState.Resolved, 'Resolved'],
]);

export class Report {
    id: number;
    description: string;
    notes: string;

    target_workout: number;
    target_plan: number;
    target_exercise: number;
    target_post: number;
    target_feature: number;
    target_user: number;
    target_comment: number;

    target_username: string;
    target_comment_text: string;

    state: ReportState;

    date: Date;
    edited_date: Date;
    user: User;

    constructor(init?: Partial<Report>) {
        Object.assign(this, init);
    }
}

