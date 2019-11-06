import { PlanSessionExercise } from './plan-session-exercise';

export class PlanSession {
  id: number;
  name: string;
  plan: string;
  exercises: PlanSessionExercise[];

  constructor() {
    this.exercises = [];
  }
}