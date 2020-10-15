export class UnitConversion {
    from: string;
    to: string;
    multiplier: number;

    constructor(init?: Partial<UnitConversion>) {
        Object.assign(this, init);
    }
}

