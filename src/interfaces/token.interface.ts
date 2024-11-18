import {Schema} from "mongoose";

export interface IToken {
    _id: Schema.Types.ObjectId;
    accessToken: string;
    refreshToken: string;
    _userId: Schema.Types.ObjectId;
    expireAt?: Date;
}