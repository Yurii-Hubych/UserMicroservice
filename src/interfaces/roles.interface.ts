import {Types} from "mongoose";

export interface IRole {
    _id: Types.ObjectId;
    name: string;
}