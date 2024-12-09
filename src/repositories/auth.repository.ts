import {Types} from "mongoose";
import {oldPasswordModel} from "../models/old-password.model";
import {ITokenPair} from "../custom-types/token.types";
import {tokenModel} from "../models/token.model";
import {userModel} from "../models/user.model";
import {IActionToken} from "../interfaces/action-token.interface";
import {actionTokenModel} from "../models/action-token";
import {actionTokenTypeEnum} from "../enums/action-token-type.enum";
import {IUser} from "../interfaces/user.interface";
import {AuthType} from "../enums/auth-type.enum";
import {googleProfile} from "../custom-types/google-profile";
import {IEmployee} from "../interfaces/employee.interface";
import {rabbitMQ} from "../rabbitMQ";

class AuthRepository {
    public async saveOldPassword(hashedPassword: string, createdUser:Types.ObjectId): Promise<void> {
        await oldPasswordModel.create({password: hashedPassword, _userId: createdUser._id})
    }

    public async saveTokenPair(tokens: ITokenPair, userId: Types.ObjectId): Promise<void> {
        await tokenModel.create({...tokens, _userId: userId});
    }

    public async deleteTokenPair(tokenEntity: ITokenPair): Promise<void> {
        await tokenModel.findOneAndDelete({refreshToken: tokenEntity.refreshToken}).lean();
    }

    public async updatePassword(userId: Types.ObjectId, hashedNewPassword: string): Promise<void> {
        await userModel.findByIdAndUpdate(userId, {password: hashedNewPassword})
    }

    public async saveActionToken(actionToken: IActionToken){
        await actionTokenModel.create(actionToken)
    }

    public async getOldPasswords(userId: Types.ObjectId) {
        return oldPasswordModel.find({_userId: userId}).lean();
    }

    public async deleteActionToken(actionToken: actionTokenTypeEnum, userId: Types.ObjectId) {
        await actionTokenModel.deleteMany({_userId: userId, tokenType: actionToken})
    }

    public async findOrCreateGoogleUser(profile: googleProfile):Promise<IUser>{
        const user = await userModel.findOne({ssoId: profile.id}).populate("_roles", "name").lean();
        if(user){
            return user;
        }
        const createdUser = await userModel.create({
            email: profile.email,
            ssoId: profile.id,
            authType: AuthType.GOOGLE,
            isVerified: profile.verified_email
        });

        const userWithRoles = await userModel.findOne({ssoId: profile.id}).lean().populate("_roles", "name");

        const employee:IEmployee = {
            _id: createdUser._id,
            name: profile.name,
            roles: ["user"]
        }
        rabbitMQ.sendMessage("registerUser", JSON.stringify(employee));

        return userWithRoles ? userWithRoles : createdUser;
    }
}

export const authRepository = new AuthRepository();