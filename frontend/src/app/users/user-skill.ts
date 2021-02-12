import { User } from "../user";
import { Skill } from "./skill";
import { UserSkillsService } from "./user-skills.service";

export class UserSkill {
    id: number;
    experience: number;
    level: number;
    skill: Skill;
    user: number;
}
