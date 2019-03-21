import { IRequest } from "../../interfaces/request.interface";
import { Response } from "express";
import { NextFunction } from "express-serve-static-core";
import { CheckModel } from "../../models/check.model";
import { CheckService } from "./check.service";
import { Buffer } from "buffer";

import * as path from "path";
import * as fs from "fs";
import { SingleCheck } from "./single-check";

export class CheckController {

    static async singleCheck (req: IRequest, res: Response, next: NextFunction) {
        const { nomer, vin, regNumber, frameNumber, bodyNumber } = req.body;
        let singleCheck = new SingleCheck(
            nomer,
            vin,
            regNumber,
            frameNumber,
            bodyNumber
        );

        try {
            var response = await singleCheck.startCheck();
        } catch ({ message }) {
            return next ({
                status: 500,
                message
            });
        }

        res.json(response);
    }

    static async create (req: IRequest, res: Response, next: NextFunction) {
        const { start, end, expert, client, nomers } = req.body;

        try {
            var result = await CheckService.create(expert, client, start, end, nomers);
        } catch ({ message }) {
            return next ({
                status: 500,
                message
            });
        }

        res.json(result);
    }

    static async getAll (req: IRequest, res: Response, next: NextFunction) {
        const { skip, limit } = req.query;

        try {
            var result: any = await CheckService.getAll(skip, limit);
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
            var result: CheckModel = await CheckService.getById(id);
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
            var result: any = await CheckService.remove(id);
        } catch ({ message }) {
            return next ({
                status: 500,
                message
            });
        }

        res.json(result);
    }

    static async getXls (req: IRequest, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            var result: any = await CheckService.getXls(id);
        } catch ({ message }) {
            return next ({
                status: 500,
                message
            });
        }

        try {
            var file = fs.createReadStream(result);
            var stat = fs.statSync(result);
        } catch ({ message }) {
            return next({
                status: 500,
                message
            });
        }

        await CheckController.pause(1000);

        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=" + "check_result.xlsx");

        file.pipe(res);
        fs.unlinkSync(result);
    }

    //-------------------------------------------------
    static pause (time: number) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

}