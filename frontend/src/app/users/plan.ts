import { PlanSession } from './plan-session';
import { PlanProgressionStrategy } from './plan-progression-strategy';

export class Plan {
  id: number;
  short_name: string;
  name: string;
  description: string;
  owner: string;
  sessions: PlanSession[];
  progressions: PlanProgressionStrategy[];

  constructor() {
    this.sessions = [];
    this.progressions = [];
  }
}