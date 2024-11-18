import {Schema} from "mongoose";

export interface IBlockedUser {
    _userId: Schema.Types.ObjectId,
    _blockedUserId: Schema.Types.ObjectId,
    _blockedAt: Schema.Types.Date
}