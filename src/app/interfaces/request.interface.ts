import { Request } from "express";
import { ClientModel } from "../models/client.model";
import { UserModel } from "../models/user.model";

export interface IRequest extends Request {
    currentUser: UserModel,
    currentAppClient: ClientModel
}