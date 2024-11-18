import * as jwt from 'jsonwebtoken';
import {configs} from "../configs/configs";
import {IActionTokenPayload, ITokenPair, ITokenPayload} from "../custom-types/token.types";
import {ApiError} from "../errors/api.error";
import {TokenTypeEnum} from "../enums/token-type.enum";
import {IActionToken} from "../interfaces/action-token.interface";

class TokenService {
    public generateTokenPair(payload: ITokenPayload):ITokenPair {
        const accessToken = jwt.sign(payload, configs.JWT_ACCESS_SECRET, {expiresIn: "1d"});
        const refreshToken = jwt.sign(payload, configs.JWT_REFRESH_SECRET, {expiresIn: "30d"});

        return {
            accessToken, refreshToken
        }
    }

    public generateActionToken(payload: IActionTokenPayload, type: TokenTypeEnum):string {
        let secret: string;
        switch (type) {
            case TokenTypeEnum.RESET:
                secret = configs.JWT_RESET_SECRET;
                break;
            case TokenTypeEnum.ACTIVATE:
                secret = configs.JWT_ACTIVATE_SECRET;
                break;
            default:
                throw new ApiError("Token type is not valid", 401);
        }
        return jwt.sign(payload, secret, {expiresIn: "1d"});
    }

    public checkToken(token: string, type: TokenTypeEnum):ITokenPayload {
        try {
            let secret: string;
            switch (type) {
                case TokenTypeEnum.ACCESS:
                    secret = configs.JWT_ACCESS_SECRET;
                    break;
                case TokenTypeEnum.REFRESH:
                    secret = configs.JWT_REFRESH_SECRET;
                    break;
                case TokenTypeEnum.ACTIVATE:
                    secret = configs.JWT_ACTIVATE_SECRET;
                    break;
                case TokenTypeEnum.RESET:
                    secret = configs.JWT_RESET_SECRET;
                    break;
                default:
                    throw new ApiError("Token type is not valid", 401);
            }
            return jwt.verify(token, secret) as ITokenPayload;
        }
        catch (e) {
            throw new ApiError("Invalid token", 401);
        }
    }

    public checkActionToken(token: string, type: TokenTypeEnum):IActionToken {
        try {
            let secret: string;
            switch (type) {
                case TokenTypeEnum.ACTIVATE:
                    secret = configs.JWT_ACTIVATE_SECRET;
                    break;
                case TokenTypeEnum.RESET:
                    secret = configs.JWT_RESET_SECRET;
                    break;
                default:
                    throw new ApiError("Token type is not valid", 401);
            }
            return jwt.verify(token, secret) as IActionToken;
        }
        catch (e) {
            throw new ApiError("Invalid token", 401);
        }
    }
}

export const tokenService = new TokenService();