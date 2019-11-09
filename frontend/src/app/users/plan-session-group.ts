import { PlanSessionGroupExercise } from './plan-session-group-exercise';

export class PlanSessionGroup {
  id: number;
  order: number;
  name: string;
  session: number;
  exercises: PlanSessionGroupExercise[];

  constructor() {
    this.exercises = [];
  }
}