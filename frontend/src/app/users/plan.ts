import { PlanSession } from './plan-session';
import { ProgressionStrategy } from './plan-progression-strategy';
import { User } from '../user';

export class Plan {
  id: number;
  short_name: string;
  name: string;
  description: string;
  user: User;
  public: boolean;
  parent_plan: number;
  sessions: PlanSession[];
  progressions: ProgressionStrategy[];

  constructor() {
    this.sessions = [];
    this.progressions = [];
  }
}