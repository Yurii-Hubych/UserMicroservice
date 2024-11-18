import Router from 'express';
import {authController} from "../controllers/auth.controller";
import {commonMiddleware} from "../middlewares/common.middleware";
import {UserValidator} from "../validators/user.validator";
import {userMiddleWare} from "../middlewares/user.middleware";
import {ICredentials} from '../custom-types/token.types';
import {authMiddleware} from "../middlewares/auth.middleware";
import {IUser} from "../interfaces/user.interface";
import {TokenTypeEnum} from "../enums/token-type.enum";


const router = Router();

router.post("/register", commonMiddleware.isBodyValid(UserValidator.createUser), userMiddleWare.FindOrThrow<IUser>("email"), authController.register);
router.post("/login", commonMiddleware.isBodyValid(UserValidator.login), userMiddleWare.isUserExists<ICredentials>("email"), authController.login);
router.post("/refresh", authMiddleware.CheckRefreshToken, authController.refresh);
router.post("/password/change", commonMiddleware.isBodyValid(UserValidator.changePassword), authMiddleware.CheckAccessToken, authController.changePassword);
router.post("/password/forgot", commonMiddleware.isBodyValid(UserValidator.forgotPassword), userMiddleWare.isUserExists<ICredentials>("email"), authController.forgotPassword);
router.put("/password/forgot/:actionToken", commonMiddleware.isBodyValid(UserValidator.forgotPasswordActionToken), authMiddleware.CheckActionToken(TokenTypeEnum.RESET), authController.setForgotPassword)

// TODO router.post("/register-admin", CommonMiddleware.isBodyValid(UserValidator.createUser), authController.registerAdmin);
// TODO email verification

export const authRouter = router;