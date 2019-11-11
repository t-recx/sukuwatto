import { PlanSessionGroupExercise } from './plan-session-group-exercise';
import { PlanSessionGroupWarmUp } from './plan-session-group-warmup';
import { PlanProgressionStrategy } from './plan-progression-strategy';

export class PlanSessionGroup {
  id: number;
  order: number;
  name: string;
  session: number;
  exercises: PlanSessionGroupExercise[];
  warmups: PlanSessionGroupWarmUp[];
  progressions: PlanProgressionStrategy[];

  constructor() {
    this.exercises = [];
    this.warmups = [];
    this.progressions = [];
  }
}