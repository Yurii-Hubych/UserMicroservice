import {roleModel} from "../models/role.model";
import {IRole} from "../interfaces/roles.interface";
import {rolePermissions, rolePriority} from "../constants/role.constants";
import {roleRepository} from "../repositories/role.repository";

class RoleService {
    public async getAllRoles(): Promise<IRole[]> {
        return await roleRepository.getAllRoles();
    }

    public async createRole(roleName: string): Promise<void> {
        await roleRepository.createRole(roleName);
    }

    public canModifyRoles(requesterRoles: string[], targetRole: string): boolean {
        return requesterRoles.some((role) => rolePermissions[role]?.canModifyRoles.includes(targetRole));
    }

    public getHighestRole(roles: string[]): string {
        const rolesOrder = rolePriority;
        return roles.reduce((acc, role) => {
            return rolesOrder[role] > rolesOrder[acc] ? role : acc;
        })
    }
}

export const roleServices = new RoleService();