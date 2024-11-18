import Joi from "joi";

export class RoleValidator {
    static roleName = Joi.string().required().trim();

    public static createRole = Joi.object({
        name: this.roleName
    });
}
