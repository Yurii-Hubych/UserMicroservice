import {Schema, model} from "mongoose";
import {actionTokenTypeEnum} from "../enums/action-token-type.enum";
import {IActionToken} from "../interfaces/action-token.interface";

const ActionTokenScheme = new Schema<IActionToken>({
    tokenType: {
        type: String,
        required: true,
        enum: actionTokenTypeEnum
    },
    _userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    actionToken: {
        type: String,
        required: true
    }
}, {versionKey: false, timestamps: true});

export const actionTokenModel = model<IActionToken>("ActionToken", ActionTokenScheme);