import {NextFunction, Request, Response} from "express";
import {authService} from "../services/auth.service.js"
import {ITokenPayload} from "../custom-types/token.types.js";
import {IUser} from "../interfaces/user.interface";
import {IActionToken} from "../interfaces/action-token.interface";
import axios from "axios";
import {configs} from "../configs/configs";

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

    //TODO implement using cookies
    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const tokenPair = await authService.login(req.body, res.locals?.user)
            res.cookie("accessToken", JSON.stringify(tokenPair.accessToken), {httpOnly: true, secure: true, sameSite: "lax"});
            res.cookie("refreshToken", JSON.stringify(tokenPair.refreshToken), {httpOnly: true, secure: true, sameSite: "lax"});
            res.status(200).json(tokenPair);
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

    public async validateAccessToken(req: Request, res: Response, next: NextFunction) {
        try {
            res.status(200).json(res.locals.tokenPayload);
        }
        catch (e) {
            next(e);
        }
    }

    public async googleAuthGetCode(req: Request, res: Response, next: NextFunction) {
        try {
            const CLIENT_ID = configs.CLIENT_ID;
            const REDIRECT_URI = configs.GOOGLE_REDIRECT_URI;
            const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
            res.json(url);
        }
        catch (e) {
            next(e);
        }
    }

    public async googleLogin(req: Request, res: Response, next: NextFunction) {
        const {code} = req.query;
        try {
            const tokenPair = await authService.googleLogin(code as string);

            console.log(tokenPair);
            res.json(tokenPair);
        } catch (e) {
            console.log(e);
            next(e);
        }
    }
}

export const authController = new AuthController();