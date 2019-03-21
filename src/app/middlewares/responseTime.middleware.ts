import { Request, Response, NextFunction } from "express";

import { Logger } from "../../logger";
let logger = new Logger();

export default function (req: Request, res: Response, next: NextFunction) {
    // Засечь начало
    var beginTime = Date.now();
    // В конце ответа
    res.on('finish',()=>{
        var d =  Date.now();// получить дату в мс
        logger.log('Reponse time: ' + (d - beginTime) + ' ms',{
            url:req.baseUrl || req.url, // записать в лог куда пришел запрос (Включает urlencode string :)
            time:(d - beginTime) // сколько прошло времени
        });
    });
    // Передать действие другому обработчику
    next();
}