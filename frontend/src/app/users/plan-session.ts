import { PlanSessionGroup } from './plan-session-group';

export class PlanSession {
  id: number;
  name: string;
  plan: number;
  groups: PlanSessionGroup[];

  constructor() {
    this.groups = [];
  }
}