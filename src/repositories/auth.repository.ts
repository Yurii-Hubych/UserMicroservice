import {Types} from "mongoose";
import {oldPasswordModel} from "../models/old-password.model";
import {ITokenPair} from "../custom-types/token.types";
import {tokenModel} from "../models/token.model";
import {userModel} from "../models/user.model";
import {IActionToken} from "../interfaces/action-token.interface";
import {actionTokenModel} from "../models/action-token";
import {actionTokenTypeEnum} from "../enums/action-token-type.enum";

class AuthRepository {
    public async saveOldPassword(hashedPassword: string, createdUser:Types.ObjectId): Promise<void> {
        await oldPasswordModel.create({password: hashedPassword, _userId: createdUser._id})
    }

    public async saveTokenPair(tokens: ITokenPair, userId: Types.ObjectId): Promise<void> {
        await tokenModel.create({...tokens, _userId: userId});
    }

    public async deleteTokenPair(tokenEntity: ITokenPair): Promise<void> {
        await tokenModel.findOneAndDelete({refreshToken: tokenEntity.refreshToken})
    }

    public async updatePassword(userId: Types.ObjectId, hashedNewPassword: string): Promise<void> {
        await userModel.findByIdAndUpdate(userId, {password: hashedNewPassword})
    }

    public async saveActionToken(actionToken: IActionToken){
        await actionTokenModel.create(actionToken)
    }

    public async getOldPasswords(userId: Types.ObjectId) {
        return oldPasswordModel.find({_userId: userId});
    }

    public async deleteActionToken(actionToken: actionTokenTypeEnum, userId: Types.ObjectId) {
        await actionTokenModel.deleteMany({_userId: userId, tokenType: actionToken})
    }
}

export const authRepository = new AuthRepository();