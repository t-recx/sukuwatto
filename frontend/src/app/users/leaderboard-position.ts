import { User } from "../user";

export class LeaderboardPosition {
    user: User;
    rank: number;
    experience: number;
}

export enum LeaderboardTimespan {
    Week = 'w',
    Month = 'm',
    Year = 'y',
    AllTime = 'a'
}
