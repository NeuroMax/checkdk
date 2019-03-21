import { Request, Response, NextFunction } from "express";
import * as cluster from "cluster";
import { Logger } from "../../logger";
let logger = new Logger();

export default (req: Request, res: Response, next: NextFunction) => {
    
    logger.log('Worker used -- ' + cluster.worker.id + ' Method: ' + req.method + ' | Request: ' + req.originalUrl, req.body);

    next();
}