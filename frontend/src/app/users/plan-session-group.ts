import { PlanSessionGroupExercise } from './plan-session-group-exercise';
import { PlanSessionGroupWarmUp } from './plan-session-group-warmup';
import { ProgressionStrategy } from './plan-progression-strategy';

export class PlanSessionGroup {
  id: number;
  order: number;
  name: string;
  session: number;
  exercises: PlanSessionGroupExercise[];
  warmups: PlanSessionGroupWarmUp[];
  progressions: ProgressionStrategy[];

  constructor() {
    this.exercises = [];
    this.warmups = [];
    this.progressions = [];
  }
}