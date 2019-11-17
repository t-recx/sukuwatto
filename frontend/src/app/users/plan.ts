import { PlanSession } from './plan-session';
import { ProgressionStrategy } from './plan-progression-strategy';

export class Plan {
  id: number;
  short_name: string;
  name: string;
  description: string;
  owner: string;
  public: boolean;
  parent_plan: number;
  sessions: PlanSession[];
  progressions: ProgressionStrategy[];

  constructor() {
    this.sessions = [];
    this.progressions = [];
  }
}