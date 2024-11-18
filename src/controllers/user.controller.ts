import { Request, Response, NextFunction} from "express";
import {userService} from "../services/user.service";

class UserController {
    public async asignRoleToUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await userService.asignRoleToUser(req.params.userId, req.body.roleId);
            res.status(200).json(user);
        } catch (e) {
            next(e);
        }
    }

    public async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const {_id, _roles} = res.locals.tokenPayload;
            if (_id == req.params.userId) {
                throw new Error("You can't delete yourself");
            }
            if (_roles.includes("manager")){
                await userService.deleteManager(req.params.userId);
            }else {
                await userService.deleteUser(req.params.userId);
            }
            res.status(204).send();
        } catch (e) {
            next(e);
        }
    }

    public async blockUser(req: Request, res: Response, next: NextFunction) {
        try {
            await userService.blockUser(req.params.userId);
            res.status(204).send();
        } catch (e) {
            next(e);
        }
    }

    public async unblockUser(req: Request, res: Response, next: NextFunction) {
        try {
            await userService.unblockUser(req.params.userId);
            res.status(204).send();
        } catch (e) {
            next(e);
        }
    }
}

export const userController = new UserController();