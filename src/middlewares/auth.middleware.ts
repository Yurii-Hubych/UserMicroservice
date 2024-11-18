import {NextFunction, Request, Response} from "express";
import {ApiError} from "../errors/api.error";
import {tokenModel} from "../models/token.model";
import {tokenService} from "../services/token.service";
import {TokenTypeEnum} from "../enums/token-type.enum";
import {actionTokenModel} from "../models/action-token";

class AuthMiddleware {
    public async CheckAccessToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accessToken = req.headers.authorization;
            if (!accessToken) {
                throw new ApiError("Access token is missing", 401);
            }

            const tokenPayload = tokenService.checkToken(accessToken, TokenTypeEnum.ACCESS);

            if (tokenPayload.isBlocked) {
                throw new ApiError("Your account is blocked", 401);
            }
            const tokenEntity = await tokenModel.findOne({accessToken});
            if (!tokenEntity) {
                throw new ApiError("Invalid access token", 401);
            }
            res.locals.tokenPayload = tokenPayload;
            next();
        } catch (e) {
            next(e);
        }
    }


    public async CheckRefreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const refreshToken = req.headers.authorization;
            if (!refreshToken) {
                throw new ApiError("Refresh token is missing", 401);
            }

            const tokenPayload = tokenService.checkToken(refreshToken, TokenTypeEnum.REFRESH);

            const tokenEntity = await tokenModel.findOne({refreshToken});
            if (!tokenEntity) {
                throw new ApiError("Invalid refresh token", 401);
            }
            res.locals.tokenPayload = tokenPayload;
            res.locals.tokenEntity = tokenEntity;
            next();
        } catch (e) {
            next(e);
        }
    }

    public CheckActionToken(tokenType: TokenTypeEnum) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const actionToken = req.params.actionToken;

                if (!actionToken) {
                    throw new ApiError("Action token is missing", 401);
                }

                const tokenPayload = tokenService.checkActionToken(actionToken, tokenType);
                if (!tokenPayload) {
                    throw new ApiError("Invalid action token", 401);
                }

                const tokenEntity = await actionTokenModel.findOne({actionToken});
                if (!tokenEntity) {
                    throw new ApiError("Invalid action token", 401);
                }

                res.locals.tokenPayload = tokenPayload;
                res.locals.tokenEntity = tokenEntity;
                next()
            }
            catch (e) {
                next(e)
            }
        }
    }

    public CheckRequiredRole(role: string) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                const tokenPayload = res.locals.tokenPayload;
                if (!tokenPayload._roles.includes(role)) {
                    throw new ApiError("Access denied", 403);
                }
                next();
            } catch (e) {
                next(e);
            }
        }
    }
}

export const authMiddleware = new AuthMiddleware();