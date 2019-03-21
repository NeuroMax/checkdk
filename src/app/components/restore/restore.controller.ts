import { IRequest } from "../../interfaces/request.interface";
import { Response, NextFunction } from "express";
import { RestoreService } from "./restore.service";
import { RestoreModel } from "../../models/restore.model";

export class RestoreController {
    static async create (req: IRequest, res: Response, next: NextFunction) {
        const { experts, nomers } = req.body;

        try {
            var result = await RestoreService.create(experts, nomers);
        } catch ({ message }) {
            return next({
                status: 500,
                message
            });
        }

        res.json(result);
    }

    static async getAll (req: IRequest, res: Response, next: NextFunction) {
        const { skip, limit } = req.query;

        try {
            var result: any = await RestoreService.getAll(skip, limit);
        } catch ({ message }) {
            return next ({
                status: 500,
                message
            });
        }

        res.json(result);
    }

    static async getById (req: IRequest, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            var result: RestoreModel = await RestoreService.getById(id);
        } catch ({ message }) {
            return next ({
                status: 500,
                message
            });
        }

        res.json(result);
    }

    static async remove (req: IRequest, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            var result: any = await RestoreService.remove(id);
        } catch ({ message }) {
            return next ({
                status: 500,
                message
            });
        }

        res.json(result);
    }
}