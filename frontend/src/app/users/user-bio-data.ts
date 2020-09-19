import { User } from '../user';
import { Visibility } from '../visibility';

export class UserBioData {
    id: number;
    date: Date;
    weight: number;
    weight_unit: number;
    height: number;
    height_unit: number;
    body_fat_percentage: number;
    water_weight_percentage: number;
    muscle_mass_percentage: number;
    bone_mass_weight: number;
    bone_mass_weight_unit: number;
    notes: string;
    user: User;
    creation: Date;
    likes: number;
    comment_number: number;
    visibility: Visibility;

    constructor() {
    }
}