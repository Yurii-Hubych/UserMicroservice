import {Types} from "mongoose";
import {actionTokenTypeEnum} from "../enums/action-token-type.enum";

export interface IActionToken {
    _id?: Types.ObjectId;
    _userId: Types.ObjectId;
    tokenType: actionTokenTypeEnum;
    actionToken: string;
    expireAt?: Date;
}