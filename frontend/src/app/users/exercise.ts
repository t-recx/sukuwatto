import { User } from '../user';

export enum ExerciseType {
    Cardio = 'c',
    Strength = 's',
}

export const ExerciseTypeLabel = new Map<string, string>([
  [ExerciseType.Cardio, 'Cardio'],
  [ExerciseType.Strength, 'Strength'],
]);

export enum Mechanics {
    Compound = 'c',
    Isolated = 'i',
}

export const MechanicsLabel = new Map<string, string>([
  [Mechanics.Compound, 'Compound'],
  [Mechanics.Isolated, 'Isolated'],
]);

export enum Force {
    Pull = 'p',
    Push = 'q',
    Static = 's',
}

export const ForceLabel = new Map<string, string>([
  [Force.Pull, 'Pull'],
  [Force.Push, 'Push'],
  [Force.Static, 'Static'],
]);

export enum Modality {
    FreeWeights = 'f',
    Machine = 'm',
    Cable = 'c',
}

export const ModalityLabel = new Map<string, string>([
  [Modality.FreeWeights, 'Free weights'],
  [Modality.Machine, 'Machine'],
  [Modality.Cable, 'Cable'],
]);

export enum Section {
    Upper = 'u',
    Lower = 'l',
    Core = 'c',
}

export const SectionLabel = new Map<string, string>([
  [Section.Upper, 'Upper'],
  [Section.Lower, 'Lower'],
  [Section.Core, 'Core'],
]);

export enum Level {
    Advanced = 'a',
    Beginner = 'b',
    Intermediate = 'i',
}

export const LevelLabel = new Map<string, string>([
  [Level.Advanced, 'Advanced'],
  [Level.Beginner, 'Beginner'],
  [Level.Intermediate, 'Intermediate'],
]);

export class Exercise {
    id: number;
    exercise_type: ExerciseType;
    exercise_typeLabel: string;
    short_name: string;
    name: string;
    description: string;
    section: Section;
    sectionLabel: string;
    modality: Modality;
    modalityLabel: string;
    force: Force;
    forceLabel: string;
    mechanics: Mechanics;
    mechanicsLabel: string;
    muscle: string;
    level: Level;
    levelLabel: string;
    user: User;
    creation: Date;

    constructor(init?: Partial<Exercise>) {
        Object.assign(this, init);
    }
}
