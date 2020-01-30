export class Action {
    actor_content_type: any;
    actor_object_id: string;
    actor: any;

    verb: string;
    description: string;

    target_content_type: any;
    target_object_id: string;
    target: any;

    action_object_content_type: any;
    action_object_object_id: string;
    action_object: any;

    timestamp: Date;

    public: boolean;
}