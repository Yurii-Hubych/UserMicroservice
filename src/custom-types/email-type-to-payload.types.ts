import {EmailTypeEnum} from "../enums/email-type";

export type EmailPayloadCombinedType = {
    actionToken: string;
    frontendUrl?: string;
};

export type EmailPayloadType = {
    [EmailTypeEnum.WELCOME]: EmailPayloadCombinedType;
    [EmailTypeEnum.FORGOT_PASSWORD]: EmailPayloadCombinedType;
}