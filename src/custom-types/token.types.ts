import {IToken} from "../interfaces/token.interface";
import {IUser} from "../interfaces/user.interface";
import {actionTokenTypeEnum} from "../enums/action-token-type.enum";

export type ITokenPair = Omit<IToken, "_userId" | "expireAt" | "_id">;

export type ICredentials = Pick<IUser, "email" | "password">;

export interface ITokenPayload extends Pick<IUser, "_id" | "status"> {
    _roles: string[];
    isBlocked: boolean;
    isDeleted: boolean;
}

export interface IActionTokenPayload extends  Pick<IUser, "_id">{
    action: actionTokenTypeEnum;
}