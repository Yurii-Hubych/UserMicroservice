import {Types} from "mongoose";
import {RolesArray} from "../custom-types/user.types";
import {AuthType} from "../enums/auth-type.enum";

export interface IUser {
    _id: Types.ObjectId
    email: string;
    password: string;
    name: string;
    surname: string;
    _roles: Types.ObjectId[] | RolesArray[];
    status: string;
    deletedAt: Date | null;
    authType: AuthType;
    ssoId: string;
    isVerified: boolean;
}