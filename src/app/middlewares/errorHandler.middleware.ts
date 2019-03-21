import { Request, Response, NextFunction } from "express";
import { Logger } from "../../logger";
import { IRequest } from "../interfaces/request.interface";
let logger = new Logger();

export default (err, req: IRequest, res: Response, next: NextFunction) => {
    let params: any = {
        headers: req.headers,
        url: req.url,
        err
    }

    if (req.currentAppClient) params.app = req.currentAppClient.title;
    if (req.currentUser) params.user = req.currentUser.login;

    if (err.status === 500) {
        logger.error('ERROR:', params);
    } else {
        logger.warn('Warning:', params);
    }
    
    res.status(err.status).json(err.stack || err);
}