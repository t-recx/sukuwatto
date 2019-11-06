import { PlanSession } from './plan-session';

export class Plan {
  id: number;
  short_name: string;
  name: string;
  description: string;
  owner: string;
  sessions: PlanSession[];

  constructor() {
    this.sessions = [];
  }
}