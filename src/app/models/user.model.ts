import { Document } from "mongoose";
import { IUser } from "../interfaces/user.interface";

export interface UserModel extends IUser, Document {
    comparePassword (password: string): Boolean
}