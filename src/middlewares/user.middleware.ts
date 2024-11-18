import {NextFunction, Request, Response} from "express";
import {userModel} from "../models/user.model";
import {ApiError} from "../errors/api.error";
import {IRole} from "../interfaces/roles.interface";
import {RolesArray} from "../custom-types/user.types";
import {roleServices} from "../services/role.service";
import {UserStatuses} from "../enums/userStatuses";

class UserMiddleware {
    public isUserExists<T> (field: keyof T) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const user = await userModel.findOne({[field]: req.body[field]}).populate("_roles", "name");

                if (user) {
                    if (user?.status === UserStatuses.deleted){
                        throw new ApiError("User is deleted", 400);
                    }
                    res.locals.user = user;
                    next();
                } else {
                    throw new ApiError( "User not found", 404);
                }
            } catch (e) {
                next(e);
            }
        }
    }

    public FindOrThrow<T> (field: keyof T) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const user = await userModel.findOne({[field]: req.body[field]});
                if (user) {
                    throw new ApiError( "User already exists", 400);
                }

                next()
            } catch (e) {
                next(e);
            }
        }
    }

    public async FindOrThrowPathVariable (req: Request, res: Response, next: NextFunction) {
        try {
            const {userId} = req.params;
            const user = await userModel.findById(userId);
            if (!user) {
                throw new ApiError( "User doesn't exists", 400);
            }

            next();
        } catch (e) {
            next(e);
        }
    }

    public async FindAndCheckRightsToModify (req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const requesterId = res.locals.tokenPayload.userId;

            if (userId === requesterId) {
                return next();
            }

            const user = await userModel.findById(userId).populate("_roles", "name");
            if (!user) {
                return next(new ApiError("User doesn't exist", 400));
            }

            const requesterRoles = res.locals.tokenPayload._roles;
            const targetRoles = (user._roles as RolesArray[]).map(role => role.name);
            const highestRole = roleServices.getHighestRole(targetRoles);

            if (!roleServices.canModifyRoles(requesterRoles, highestRole)) {
                return next(new ApiError("Access denied. Insufficient permissions.", 403));
            }

            next();
        } catch (e) {
            next(e);
        }
    }
}


export const userMiddleWare = new UserMiddleware();