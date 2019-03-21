import { Response, NextFunction } from "express";
import { IRequest } from "../interfaces/request.interface";
import config from "../../config";
import { AuthService } from "../components/auth/auth.service";

/**
 * @param roles Массив ролей для которых разрешен доступ
 */
export default function (...roles: string[]) {
    return function (req: IRequest, res: Response, next: NextFunction) {

        if (AuthService.checkAccess(roles, req.currentUser)) {
            return next();
        }

        return next({
            status: 403,
            message: 'У вас не достаточно прав!'
        });
    }
}