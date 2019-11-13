import { PlanSessionGroup } from './plan-session-group';
import { ProgressionStrategy } from './plan-progression-strategy';

export class PlanSession {
  id: number;
  name: string;
  plan: number;
  groups: PlanSessionGroup[];
  progressions: ProgressionStrategy[];

  constructor() {
    this.groups = [];
    this.progressions = [];
  }
}