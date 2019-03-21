import { Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../../config";
import { IRequest } from "../interfaces/request.interface";

import { Logger } from "../../logger";
import { AuthService } from "../components/auth/auth.service";
const logger = new Logger();

export default async (req: IRequest, res: Response, next: NextFunction) => {
    
    if (AuthService.checkUserAppClient(req.currentAppClient, req.currentUser)) return next();

    return next({
        status: 403,
        message: 'Доступ запрещен! Обратитесь к администратору'
    });
}