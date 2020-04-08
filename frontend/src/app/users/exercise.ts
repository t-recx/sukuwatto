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

export class Exercise {
    id: number;
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
    user: number;

    constructor(init?: Partial<Exercise>) {
        Object.assign(this, init);
    }
}
