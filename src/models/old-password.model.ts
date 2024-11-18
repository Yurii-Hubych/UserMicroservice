import {Schema, model} from "mongoose";

const OldPasswordSchema = new Schema({
    _userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    password: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        default: Date.now() + 365 * 24 * 60 * 60 * 1000,
        index: {expires: "365d"}
    }
}, {versionKey: false, timestamps: true});

export const oldPasswordModel = model("OldPassword", OldPasswordSchema);