enum Mechanics {
    Compound = 'c',
    Isolated = 'i',
}

enum Force {
    Pull = 'p',
    Push = 'h',
    Static = 's',
}

enum Modality {
    FreeWeights = 'f',
    Machine = 'm',
    Cable = 'c',
}

enum Section {
    Upper = 'u',
    Lower = 'l',
    Core = 'c',
}

export class Exercise {
    id: number;
    name: string;
    description: string;
    section: Section;
    modality: Modality;
    force: Force;
    mechanics: Mechanics;
}