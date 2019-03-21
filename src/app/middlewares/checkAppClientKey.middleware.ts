import { Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../../config";
import { IRequest } from "../interfaces/request.interface";

import { Logger } from "../../logger";
import { ClientModel } from "../models/client.model";
import { Client } from "../schemas/client.schema";
const logger = new Logger();

export default async (req: IRequest, res: Response, next: NextFunction) => {
    const { application } = req.headers;

    if (!application) return next({
        status: 403,
        message: 'Отсутствует ключ приложения!'
    });

    try {
        var tokenObj = await jwt.verify(application, config.app.secrets.app_key);
    } catch ({ message }) {
        return next({
            status: 403,
            message: 'Не верный ключ приложения "клиента"!'
        });
    }

    if (tokenObj) {
        try {
            var client: ClientModel = await Client.findById(tokenObj._id); 
        } catch ({ message }) {
            return next({
                status: 403,
                message
            });
        }
    }

    if (!client) return next({
        status: 403,
        message: 'Ключ приложения не действителен'
    });

    // if (!client.control_center) return next({
    //     status: 403,
    //     message: 'Приложение не ЦУ'
    // });

    req.currentAppClient = client;

    next();
}