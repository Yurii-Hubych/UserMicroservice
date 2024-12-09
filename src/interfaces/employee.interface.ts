import {Types} from "mongoose";

export interface IEmployee {
    _id: Types.ObjectId;
    name: string;
    surname?: string;
    roles: [string];
}