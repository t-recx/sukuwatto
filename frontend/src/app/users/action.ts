import { Workout } from './workout';
import { Plan } from './plan';
import { Exercise } from './exercise';
import { Post } from './post';
import { User } from '../user';
import { Comment } from './comment';
import { UserBioData } from './user-bio-data';

export class Action {
    id: number;

    user: User;

    verb: string;
    description: string;

    target_workout: Workout;
    target_plan: Plan;
    target_exercise: Exercise;
    target_post: Post;
    target_comment: Comment;
    target_user_bio_data: UserBioData;
    target_user: User;

    action_object_workout: Workout;
    action_object_plan: Plan;
    action_object_exercise: Exercise;
    action_object_post: Post;
    action_object_comment: Comment;
    action_object_user_bio_data: UserBioData;
    action_object_user: User;

    timestamp: Date;
}