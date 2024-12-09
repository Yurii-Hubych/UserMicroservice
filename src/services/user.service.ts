import {userModel} from "../models/user.model";
import {rabbitMQ} from "../rabbitMQ";
import {roleModel} from "../models/role.model";
import {IRole} from "../interfaces/roles.interface";
import {UserStatuses} from "../enums/user-statuses";
import {tokenModel} from "../models/token.model";

class UserService {
    public async asignRoleToUser(userId: string, roleId: string): Promise<void | null> {
        await userModel.findOneAndUpdate({_id: userId}, {$addToSet: {_roles: roleId}}, {new: true});
        //TODO: implement role existence check
        const role = await roleModel.findById(roleId) as IRole;
        rabbitMQ.sendMessage("asignRoleToUser", JSON.stringify({userId, role: role.name}));
    }

    public async deleteUser(userId: string): Promise<void> {
        await userModel.findOneAndDelete({_id: userId});
        tokenModel.find({_userId: userId}).deleteMany();
        rabbitMQ.sendMessage("deleteUser", JSON.stringify(userId));
    }

    public async deleteManager(userId:string):Promise<void>{
        await userModel.findOneAndUpdate({_id: userId}, {status: UserStatuses.deleted});
        rabbitMQ.sendMessage("deleteUser", JSON.stringify(userId));
    }

    public async blockUser(userId: string): Promise<void> {
        await userModel.findOneAndUpdate({_id: userId}, {status: UserStatuses.blocked});
        rabbitMQ.sendMessage("blockUser", JSON.stringify(userId));
    }

    public async unblockUser(userId: string): Promise<void> {
        await userModel.findOneAndUpdate({_id: userId}, {status: UserStatuses.active});
        rabbitMQ.sendMessage("unblockUser", JSON.stringify(userId));
    }
}

export const userService = new UserService();