export class Message {
    type: string;
    uuid: string;
    date: Date;
    edited_date: Date;
    edit_unconfirmed: boolean;
    from_user: number;
    to_user: number;
    message: string;
    unreceived: boolean;
    context_menu_open: boolean;

    constructor(init?: Partial<Message>) {
        Object.assign(this, init);
    }
}