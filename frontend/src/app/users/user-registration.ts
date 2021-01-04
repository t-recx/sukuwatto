import { User } from '../user';

export class UserRegistration extends User {
    recaptcha: string;

    constructor(init?: Partial<UserRegistration>) {
        super();
        Object.assign(this, init);
    }
}
