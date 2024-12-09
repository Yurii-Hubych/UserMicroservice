import {Types} from "mongoose";
import {userModel} from "../models/user.model";
import {IUser} from "../interfaces/user.interface";

class UserRepository {
    public async updateUserPassword(userId: Types.ObjectId, password: string):Promise<void>{
        await userModel.findByIdAndUpdate(userId, {password: password})
    }

    public async findUserByFieldWithPassword<T extends keyof IUser>(field: T, value: IUser[T]):Promise<IUser | null>{
        return userModel.findOne({[field]: value}).select("+password").lean();
    }
}

export const userRepository = new UserRepository();