import Router from 'express';
import {commonMiddleware} from "../middlewares/common.middleware";
import {userController} from "../controllers/user.controller";
import {authMiddleware} from "../middlewares/auth.middleware";
import {userMiddleWare} from "../middlewares/user.middleware";


const router = Router();
router.delete("/:userId", commonMiddleware.isIdValid(["userId"]), authMiddleware.CheckAccessToken, authMiddleware.CheckRequiredRole("manager"), userMiddleWare.FindAndCheckRightsToModify, userController.deleteUser);
router.put("/:userId/roles", commonMiddleware.isIdValid(["userId"]), authMiddleware.CheckAccessToken, authMiddleware.CheckRequiredRole("admin"), userMiddleWare.FindAndCheckRightsToModify, userController.asignRoleToUser);
router.patch("/block/:userId", commonMiddleware.isIdValid(["userId"]), authMiddleware.CheckAccessToken, authMiddleware.CheckRequiredRole("admin"), userMiddleWare.FindAndCheckRightsToModify, userController.blockUser);
router.patch("/unblock/:userId", commonMiddleware.isIdValid(["userId"]), authMiddleware.CheckAccessToken, authMiddleware.CheckRequiredRole("admin"), userMiddleWare.FindAndCheckRightsToModify, userController.unblockUser);

export const userRouter = router;