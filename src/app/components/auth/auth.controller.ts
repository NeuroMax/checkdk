import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { IRequest } from "../../interfaces/request.interface";
import { Logger } from '../../../logger';
const logger = new Logger();

export class AuthController {

    /**
     * Авторизация
     */
    public static async signIn (req: IRequest, res: Response, next: NextFunction) {

        const { email, password } = req.body;

        try {
            var token = await AuthService.signIn(email, password, req.currentAppClient);
        } catch ({ message }) {
            return next({
                status: 500,
                message
            });
        }

        // logger.log('Response:', token);

        res.json(token);
    }

    /**
     *  Получение иерархии ролей
     */
    public static async getRolesHierarchy (req: IRequest, res: Response, next: NextFunction) {

        try {
            var hierarchy = await AuthService.getRolesHierarchy();
        } catch ({ message }) {
            return next({
                status: 500,
                message
            });
        }

        // logger.log('Response:', hierarchy);

        res.json(hierarchy);
    }

    public static getNameClient = async (req: IRequest, res: Response, next: NextFunction) => {
        res.json(req.currentAppClient.title);
    }

}