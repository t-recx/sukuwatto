import { PlanSessionGroup } from './plan-session-group';
import { PlanProgressionStrategy } from './plan-progression-strategy';

export class PlanSession {
  id: number;
  name: string;
  plan: number;
  groups: PlanSessionGroup[];
  progressions: PlanProgressionStrategy[];

  constructor() {
    this.groups = [];
    this.progressions = [];
  }
}