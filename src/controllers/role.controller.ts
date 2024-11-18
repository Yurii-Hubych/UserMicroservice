import {NextFunction, Request, Response} from "express";
import {roleServices} from "../services/role.service";

class RoleController {
    public async getAllRoles(req: Request, res: Response, next: NextFunction) {
        try {
            const roles = await roleServices.getAllRoles();
            res.status(200).json(roles);
        } catch (e) {
            next(e);
        }
    }

    public async createRole(req: Request, res: Response, next: NextFunction) {
        try {
            await roleServices.createRole(req.body);
            res.sendStatus(200);
        } catch (e) {
            next(e);
        }
    }
}

export const roleController = new RoleController();