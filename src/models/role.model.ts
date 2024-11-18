import {model, Schema} from "mongoose";
import {IRole} from "../interfaces/roles.interface";


const RoleScheme = new Schema<IRole>({
    name: {
        type: String,
        required: true
    }
}, {versionKey: false, timestamps: true});

export const roleModel = model<IRole>("Role", RoleScheme);