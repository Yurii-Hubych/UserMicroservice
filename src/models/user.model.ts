import {model, Schema, Types} from "mongoose";
import {UserStatuses} from "../enums/userStatuses";
import {IUser} from "../interfaces/user.interface";

const userRole = new Types.ObjectId("671629a1599aabb8c8b9397e")

const UserScheme = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        select: false
    },
    _roles: {
        type: [Types.ObjectId],
        ref: "Role",
        required: true,
        default:[userRole]
    },
    status: {
        type: String,
        required: true,
        enum: UserStatuses,
        default: UserStatuses.active
    },
    deletedAt: {
        type: Schema.Types.Date,
        default: null
    },
    isActivated: {
        type: Boolean,
        default: false
    }
}, {versionKey: false, timestamps: true});

export const userModel = model<IUser>("User", UserScheme);