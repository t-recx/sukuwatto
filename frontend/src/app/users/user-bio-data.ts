export class UserBioData {
    id: number;
    date: Date;
    weight: number;
    weight_unit: number;
    weight_unit_code: string;
    height: number;
    height_unit: number;
    height_unit_code: string;
    body_fat_percentage: number;
    water_weight_percentage: number;
    muscle_mass_percentage: number;
    bone_mass_weight: number;
    bone_mass_weight_unit: number;
    bone_mass_weight_unit_code: string;
    notes: string;

    constructor() {
    }
}