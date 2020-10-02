import { Muscle } from './muscle';

export enum MuscleRole {
    Agonist = 'a',
    Antagonist = 'n',
    Synergist = 's',
    Fixator = 'f',
    Target = 't',
    DynamicStabilizer = 'd',
    AntagonistStabilizer = 'z',
}

export const MuscleRoleLabel = new Map<string, string>([
    [MuscleRole.Agonist, 'Agonist'],
    [MuscleRole.Antagonist, 'Antagonist'],
    [MuscleRole.Synergist, 'Synergist'],
    [MuscleRole.Fixator, 'Fixator'],
    [MuscleRole.Target, 'Target'],
    [MuscleRole.DynamicStabilizer, 'Dynamic stabilizer'],
    [MuscleRole.AntagonistStabilizer, 'Antagonist stabilizer'],
]);

export class MuscleExercise {
    id: number;
    muscle: Muscle;
    role: MuscleRole;
}