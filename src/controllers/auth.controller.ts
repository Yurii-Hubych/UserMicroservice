import {NextFunction, Request, Response} from "express";
import {authService} from "../services/auth.service.js"
import {ITokenPayload} from "../custom-types/token.types.js";
import {IUser} from "../interfaces/user.interface";
import {IActionToken} from "../interfaces/action-token.interface";

class AuthController {
    public async register(req: Request, res: Response, next: NextFunction) {
        try {
            await authService.register(req.body)
            res.sendStatus(200);
        }
        catch (e) {
            next(e);
        }
    }

    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const response = await authService.login(req.body, res.locals?.user)
            res.status(200).json(response);
        }
        catch (e) {
            next(e);
        }
    }

    public async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const tokenPayload: ITokenPayload = res.locals.tokenPayload;
            const tokenEntity = res.locals.tokenEntity;
            const response = await authService.refresh(tokenPayload, tokenEntity);
            res.status(200).json(response);
        }
        catch (e) {
            next(e);
        }
    }

    public async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { _id: userId } = res.locals.tokenPayload;
            await authService.changePassword(req.body, userId);
            res.sendStatus(200);
        }
        catch (e) {
            next(e);
        }
    }

    public async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const user = res.locals.user as IUser;
            await authService.forgotPassword(user);
            res.sendStatus(200);
        }
        catch (e) {
            next(e);
        }
    }

    public async setForgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const tokenEntity = res.locals.tokenEntity as IActionToken;
            const { password } = req.body;
            await authService.setForgotPassword(tokenEntity, password);
            res.sendStatus(200);
        }
        catch (e) {
            next(e);
        }
    }
}

export const authController = new AuthController();