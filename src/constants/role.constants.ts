export const rolePermissions: {[key: string]: {canModifyRoles: string[]}} = {
    admin: { canModifyRoles: ["user", "manager"] },
    manager: { canModifyRoles: ["user"] },
    user: { canModifyRoles: [] },
};

export const rolePriority: {[key: string]: number} = { admin: 3, manager: 2, user: 1 };

export const roles = ["admin", "manager", "user"];