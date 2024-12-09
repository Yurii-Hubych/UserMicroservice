import Joi from "joi";
import {UserStatuses} from "../enums/user-statuses";
import { Types} from "mongoose";

export class UserValidator {
    static email = Joi.string().email();
    static password = Joi.string().min(6).max(30);
    static name = Joi.string().min(3).max(30).trim();
    static surname = Joi.string().min(3).max(30).trim();
    static status = Joi.valid(...Object.values(UserStatuses));
    static _roles = Joi.array().items(
        Joi.string().custom((value, helpers) => {
            if (!Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        }).required()
    );

    public static createUser = Joi.object({
        email: this.email.required(),
        password: this.password.required(),
        name: this.name.required(),
        surname: this.surname.required(),
        _role: this._roles,
        _status: this.status.default(UserStatuses.active)
    });

    public static login = Joi.object({
        email: this.email.required(),
        password: this.password.required()
    });

    public static changePassword = Joi.object({
        oldPassword: this.password.required(),
        newPassword: this.password.required()
    });

    public static forgotPassword = Joi.object({
        email: this.email.required()
    })

    public static forgotPasswordActionToken = Joi.object({
        password: this.password.required()
    })

    public static registerManager = Joi.object({
        email: this.email.required()
    })
}
