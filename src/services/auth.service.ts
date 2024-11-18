import {userModel} from "../models/user.model";
import {ApiError} from "../errors/api.error";
import {passwordService} from "./password.service";
import {tokenService} from "./token.service";
import {ICredentials, ITokenPair, ITokenPayload} from "../custom-types/token.types";
import {tokenModel} from "../models/token.model";
import {oldPasswordModel} from "../models/old-password.model";
import {emailService} from "./email.service";
import {EmailTypeEnum} from "../enums/email-type";
import {IRole} from "../interfaces/roles.interface";
import {IUser} from "../interfaces/user.interface";
import {actionTokenTypeEnum} from "../enums/action-token-type.enum";
import {IActionToken} from "../interfaces/action-token.interface";
import { actionTokenModel } from "../models/action-token";
import {TokenTypeEnum} from "../enums/token-type.enum";
import {rabbitMQ} from "../rabbitMQ";
import {IEmployee} from "../interfaces/employee.interface";
import {UserStatuses} from "../enums/userStatuses";

class AuthService {
    public async register(data: IUser): Promise<void> {
        const hashedPassword: string = await passwordService.hash(data.password);
        const {name, surname, ...userData} = data;
        const createdUser = await userModel.create({...userData, password: hashedPassword});

        const employee:IEmployee = {
            _id: createdUser._id,
            name: name,
            surname: surname,
            roles: ["user"]
        }
        rabbitMQ.sendMessage("registerUser", JSON.stringify(employee));
        await Promise.all([
            oldPasswordModel.create({password: hashedPassword, _userId: createdUser._id}),
            // TODO email verification
            emailService.sendEmail(EmailTypeEnum.WELCOME, data.email, {actionToken: "test"})
        ])
    }

    public async login(credentials: ICredentials, user: IUser): Promise<ITokenPair> {
        const userWithPassword = await userModel.findById(user._id).select("+password");
        const isMatched = await passwordService.compare(credentials.password, userWithPassword!.password)

        if (!isMatched) {
            throw new ApiError("Invalid credentials", 401);
        }

        const userRoles = (user._roles as IRole[]).map((role: IRole) => role.name) || [];


        const tokens = tokenService.generateTokenPair({
            _id: user._id,
            _roles: userRoles,
            status: user.status,
            isBlocked: user.status === UserStatuses.blocked,
            isDeleted: user.status === UserStatuses.deleted
        });
        // TODO save hashed tokens
        await tokenModel.create({...tokens, _userId: user?._id});
        return tokens;
    }

    public async refresh(user: ITokenPayload, tokenEntity: ITokenPair): Promise<ITokenPair> {

        const tokens = tokenService.generateTokenPair({
            _id: user._id,
            _roles: user._roles,
            status: user.status,
            isBlocked: user.isBlocked,
            isDeleted: user.isDeleted
        });
        await Promise.all([
            tokenModel.findOneAndDelete({refreshToken: tokenEntity.refreshToken}),
            tokenModel.create({...tokens, _userId: user._id})
            ]);
        return tokens;
    }

    public async changePassword(passwordPair: { newPassword: string, oldPassword: string }, userId: string): Promise<void> {
        const oldPasswords = await oldPasswordModel.find({_userId: userId});
        const passwordMatches = await Promise.all(oldPasswords.map( async (oldPassword) => passwordService.compare(passwordPair.newPassword, oldPassword.password)));

        if (passwordMatches.includes(true)) {
            throw new ApiError("Password can't be as one of the previous passwords", 400);
        }

        const user = await userModel.findById(userId).select("+password");
        if (!user) {
            throw new ApiError("User not found", 404);
        }

        const isMatched = await passwordService.compare(passwordPair.oldPassword, user.password);
        if (!isMatched) {
            throw new ApiError("Invalid password", 401);
        }

        const hashedNewPassword: string = await passwordService.hash(passwordPair.newPassword);

        await Promise.all([
            oldPasswordModel.create({password: hashedNewPassword, _userId: userId}),
            userModel.findByIdAndUpdate(userId, {password: hashedNewPassword})
        ])
    }

    public async forgotPassword(user: IUser): Promise<void> {
        const actionToken = tokenService.generateActionToken({_id: user._id, action: actionTokenTypeEnum.RESET_PASSWORD}, TokenTypeEnum.RESET);
        const actionTokenObject: IActionToken = {_userId: user._id, actionToken: actionToken, tokenType: actionTokenTypeEnum.RESET_PASSWORD}
        await Promise.all([
            actionTokenModel.create(actionTokenObject),
            emailService.sendEmail(EmailTypeEnum.FORGOT_PASSWORD, user.email, {actionToken: actionToken})
        ])
    }

    public async setForgotPassword(tokenEntity: IActionToken, password: string): Promise<void> {
        const user = await userModel.findById(tokenEntity._userId).select("+password");

        if (!user) {
            throw new ApiError("User not found", 404);
        }

        const oldPasswords = await oldPasswordModel.find({_userId: user._id});
        const passwordMatches = await Promise.all(oldPasswords.map( async (oldPassword) => passwordService.compare(password, oldPassword.password)));

        if (passwordMatches.includes(true)) {
            throw new ApiError("Password can't be as one of the previous passwords", 400);
        }

        const newPasswordHash = await passwordService.hash(password);
        await Promise.all([
            oldPasswordModel.create({password: newPasswordHash, _userId: user._id}),
            userModel.findByIdAndUpdate(user._id, {password: newPasswordHash}),
            actionTokenModel.deleteMany({_userId: user._id, tokenType: actionTokenTypeEnum.RESET_PASSWORD})
        ])
    }
}
export const authService = new AuthService();