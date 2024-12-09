import {roleModel} from "../models/role.model";
import {IRole} from "../interfaces/roles.interface";

class RoleRepository {
    public async getAllRoles():Promise<IRole[]>{
        return roleModel.find().lean();
    }

    public async createRole(roleName: string):Promise<void>{
        await roleModel.create(roleName);
    }
}

export const roleRepository = new RoleRepository();