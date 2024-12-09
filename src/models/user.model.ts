import {model, Schema, Types} from "mongoose";
import {UserStatuses} from "../enums/user-statuses";
import {IUser} from "../interfaces/user.interface";
import {AuthType} from "../enums/auth-type.enum";

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
        required: false,
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
    authType: {
        type : String,
        enum: AuthType,
        required: true,
        default: AuthType.LOCAL
    },
    ssoId: {
        type: String,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {versionKey: false, timestamps: true});

export const userModel = model<IUser>("User", UserScheme);