import {EmailTypeEnum} from "../enums/email-type";

export const EmailConstants = {
    [EmailTypeEnum.WELCOME]: {
        subject: "Welcome to our platform",
        template: "register"
    },
    [EmailTypeEnum.FORGOT_PASSWORD]: {
        subject: "Reset password",
        template: "reset_password"
    }
}
