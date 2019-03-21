import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../../config";
import { IRequest } from "../interfaces/request.interface";
import { AuthService } from "../components/auth/auth.service";
import { UserModel } from "../models/user.model";
import { User } from "../schemas/user.schema";

export default async (req: IRequest, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    if (!authorization) return next({
        status: 401,
        message: 'Вы не авторизованы'
    });

    try {
        var tokenObj = await jwt.verify(authorization, config.app.secrets.token);
    } catch ({ message }) {
        return next({
            status: 401,
            message
        });
    }

    if (tokenObj) {
        try {
            var user: UserModel = await User.findById(tokenObj._id); 
        } catch ({ message }) {
            return next({
                status: 403,
                message
            });
        }
    }

    if (!user) return next({
        status: 401,
        message: 'Токен не действителен'
    });

    if (tokenObj.expired < +new Date()) {
        return next({
            status: 401,
            message: 'Срок действия токена истек'
        });
    }

    if (!AuthService.checkUserEnabled(user)) {
        return next({
            status: 401,
            message: 'Вы отключены! Обратитесь в техподдержку'
        });
    }

    req.currentUser = user;

    next();
}