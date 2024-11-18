import Router from "express";
import {roleController} from "../controllers/role.controller";
import {commonMiddleware} from "../middlewares/common.middleware";
import {RoleValidator} from "../validators/role.validator";
import {authMiddleware} from "../middlewares/auth.middleware";

const router = Router();

router.get("",
    authMiddleware.CheckAccessToken,
    authMiddleware.CheckRequiredRole("admin"),
    roleController.getAllRoles);
router.post("",
    authMiddleware.CheckAccessToken,
    authMiddleware.CheckRequiredRole("admin"),
    commonMiddleware.isBodyValid(RoleValidator.createRole), roleController.createRole);
// TODO secure this route
export const roleRouter = router;