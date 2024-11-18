import bcrypt from "bcrypt";
import {configs} from "../configs/configs";

class PasswordService {
    public async hash(password: string): Promise<string> {
        return bcrypt.hash(password, +configs.JWT_SALT);
    }

    public async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}

export const passwordService = new PasswordService();