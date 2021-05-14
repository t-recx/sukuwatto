import { PlanSessionGroupExercise } from './plan-session-group-exercise';
import { PlanSessionGroupWarmUp } from './plan-session-group-warmup';
import { ProgressionStrategy } from './plan-progression-strategy';

export class PlanSessionGroup {
  id: number;
  order: number;
  name: string;
  exercises: PlanSessionGroupExercise[];
  warmups: PlanSessionGroupWarmUp[];
  progressions: ProgressionStrategy[];
  collapsed: boolean;

  constructor(init? : Partial<PlanSessionGroup>) {
    this.exercises = [];
    this.warmups = [];
    this.progressions = [];

    Object.assign(this, init);
  }
}