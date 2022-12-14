import { PlanSession } from './plan-session';
import { ProgressionStrategy } from './plan-progression-strategy';
import { User } from '../user';

export class Plan {
  id: number;
  short_name: string;
  name: string;
  description: string;
  user: User;
  creation: Date;
  public: boolean;
  parent_plan: number;
  likes: number;
  comment_number: number;
  sessions: PlanSession[];
  progressions: ProgressionStrategy[];

  constructor() {
    this.sessions = [];
    this.progressions = [];
  }
}