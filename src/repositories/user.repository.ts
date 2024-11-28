import {Types} from "mongoose";
import {userModel} from "../models/user.model";

class UserRepository {
    public async findUserByIdWithPassword(userId: Types.ObjectId){
        return userModel.findById(userId).select("+password")
    }

    public async updateUserPassword(userId: Types.ObjectId, password: string){
        userModel.findByIdAndUpdate(userId, {password: password})
    }
}

export const userRepository = new UserRepository();