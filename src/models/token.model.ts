import {Schema, model} from "mongoose";
import {IToken} from "../interfaces/token.interface";

const TokenScheme = new Schema<IToken>({
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    _userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    expireAt: {
        type: Date,
        default: Date.now() + 30 * 24 * 60 * 60 * 1000,
        index: {expires: "30d"},
    },
}, {versionKey: false, timestamps: true});

export const tokenModel = model<IToken>("Token", TokenScheme);