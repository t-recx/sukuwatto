export class Action {
    actor_content_type: any;
    actor_object_id: string;
    actor: ObjectConstruct;

    verb: string;
    description: string;

    target_content_type: any;
    target_object_id: string;
    target: ObjectConstruct;

    action_object_content_type: any;
    action_object_object_id: string;
    action_object: ObjectConstruct;

    timestamp: Date;

    public: boolean;
}

export class ObjectConstruct {
    object_type: string;
    display_name: string;
}