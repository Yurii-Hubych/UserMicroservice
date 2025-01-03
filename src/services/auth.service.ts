import {userModel} from "../models/user.model";
import {ApiError} from "../errors/api.error";
import {passwordService} from "./password.service";
import {tokenService} from "./token.service";
import {ICredentials, ITokenPair, ITokenPayload} from "../custom-types/token.types";
import {oldPasswordModel} from "../models/old-password.model";
import {emailService} from "./email.service";
import {EmailTypeEnum} from "../enums/email-type";
import {IRole} from "../interfaces/roles.interface";
import {IUser} from "../interfaces/user.interface";
import {actionTokenTypeEnum} from "../enums/action-token-type.enum";
import {IActionToken} from "../interfaces/action-token.interface";
import {TokenTypeEnum} from "../enums/token-type.enum";
import {rabbitMQ} from "../rabbitMQ";
import {IEmployee} from "../interfaces/employee.interface";
import {UserStatuses} from "../enums/user-statuses";
import {authRepository} from "../repositories/auth.repository";
import {Types} from "mongoose";
import {userRepository} from "../repositories/user.repository";
import axios from "axios";
import {configs} from "../configs/configs";

class AuthService {
    /*constructor(
        private emailService: EmailService,
        private rabbitMQ: RabbitMQService,
        private tokenService: TokenService,
        private authRepository: AuthRepository,
        private userRepository: UserRepository
    ) {}*/

    public async register(data: IUser): Promise<void> {
        const hashedPassword: string = await passwordService.hash(data.password);
        const {name, surname, ...userData} = data;
        const createdUser = await userModel.create({...userData, password: hashedPassword});

        console.log(createdUser);
        const employee:IEmployee = {
            _id: createdUser._id,
            name: name,
            surname: surname,
            roles: ["user"]
        }
        rabbitMQ.sendMessage("registerUser", JSON.stringify(employee));
        await Promise.all([
            authRepository.saveOldPassword(hashedPassword, createdUser._id),
            // TODO email verification
            //emailService.sendEmail(EmailTypeEnum.WELCOME, data.email, {actionToken: "test"})
        ])
    }

    public async login(credentials: ICredentials, user: IUser): Promise<ITokenPair> {
        const userWithPassword = await userRepository.findUserByFieldWithPassword("email", credentials.email);
        if (!userWithPassword?.password){
            console.log(userWithPassword);
            throw new ApiError("Invalid credentials", 401);
        }
        const isMatched = await passwordService.compare(credentials.password, userWithPassword!.password)

        if (!isMatched) {
            throw new ApiError("Invalid credentials", 401);
        }

        const tokens = tokenService.generateTokenPair(this.generateTokenPayload(user));
        // TODO save hashed tokens
        await authRepository.saveTokenPair(tokens, user?._id);
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
            authRepository.deleteTokenPair(tokenEntity),
            authRepository.saveTokenPair(tokens, user._id)
            ]);
        return tokens;
    }

    public async changePassword(passwordPair: { newPassword: string, oldPassword: string }, userId: string): Promise<void> {
        const user = await userModel.findById(userId).select("+password") as IUser;
        if (!user) {
            throw new ApiError("User not found", 404);
        }
        if (!user.password){
            throw new ApiError("Invalid credentials", 401);
        }

        const oldPasswords = await oldPasswordModel.find({_userId: userId});
        const passwordMatches = await Promise.all(oldPasswords.map( async (oldPassword) => passwordService.compare(passwordPair.newPassword, oldPassword.password)));

        if (passwordMatches.includes(true)) {
            throw new ApiError("Password can't be as one of the previous passwords", 400);
        }

        const isMatched = await passwordService.compare(passwordPair.oldPassword, user.password);
        if (!isMatched) {
            throw new ApiError("Invalid password", 401);
        }

        const hashedNewPassword: string = await passwordService.hash(passwordPair.newPassword);

        await Promise.all([
            authRepository.saveOldPassword(hashedNewPassword, new Types.ObjectId(userId)),
            authRepository.updatePassword(new Types.ObjectId(userId), hashedNewPassword),
        ])
    }

    public async forgotPassword(user: IUser): Promise<void> {
        const actionToken = tokenService.generateActionToken({_id: user._id, action: actionTokenTypeEnum.RESET_PASSWORD}, TokenTypeEnum.RESET);
        const actionTokenObject: IActionToken = {_userId: user._id, actionToken: actionToken, tokenType: actionTokenTypeEnum.RESET_PASSWORD}
        await Promise.all([
            authRepository.saveActionToken(actionTokenObject),
            emailService.sendEmail(EmailTypeEnum.FORGOT_PASSWORD, user.email, {actionToken: actionToken})
        ])
    }

    public async setForgotPassword(tokenEntity: IActionToken, password: string): Promise<void> {
        const user = await userRepository.findUserByFieldWithPassword("_id", tokenEntity._userId);

        if (!user) {
            throw new ApiError("User not found", 404);
        }

        const oldPasswords = await authRepository.getOldPasswords(user._id);
        const passwordMatches = await Promise.all(oldPasswords.map( async (oldPassword) => passwordService.compare(password, oldPassword.password)));

        if (passwordMatches.includes(true)) {
            throw new ApiError("Password can't be as one of the previous passwords", 400);
        }

        const newPasswordHash = await passwordService.hash(password);
        await Promise.all([
            authRepository.saveOldPassword(newPasswordHash, user._id),
            authRepository.updatePassword(user._id, newPasswordHash),
            userRepository.updateUserPassword(user._id, newPasswordHash),
            authRepository.deleteActionToken(actionTokenTypeEnum.RESET_PASSWORD, user._id),
        ])
    }

    public async googleLogin(code: string){
        const {data} = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: configs.CLIENT_ID,
            client_secret: configs.CLIENT_SECRET,
            code,
            redirect_uri: configs.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
        });
        const {access_token, id_token} = data;

        const {data: profile} = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
            headers: {Authorization: `Bearer ${access_token}`},
        });

        const user = await authRepository.findOrCreateGoogleUser(profile);

        const tokens = tokenService.generateTokenPair(this.generateTokenPayload(user));
        // TODO save hashed tokens
        await authRepository.saveTokenPair(tokens, user?._id);
        return tokens;
    }

    private generateTokenPayload(user: IUser): ITokenPayload {
        const userRoles = (user._roles as IRole[]).map((role: IRole) => role.name) || [];
        return {
            _id: user._id,
            _roles: userRoles,
            status: user.status,
            isBlocked: user.status === UserStatuses.blocked,
            isDeleted: user.status === UserStatuses.deleted,
        };
    }
}
export const authService = new AuthService();