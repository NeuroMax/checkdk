import { ExpertModel } from "../models/expert.model";
import { ClientModel } from "../models/client.model";
import { DkModel } from "../models/dk.model";
import { IDk } from "./dk.interface";

export interface ICheck {

    // нумерованный ID
    chkId?: number,

    //Дата создания
    dateCreate?: Date,

    // Период проверки - начало
    start: Date,

    // Период проверки - конец
    end: Date,

    //Время начала проверки
    startCheck?: Date,

    //Время окончания проверки
    endCheck?: Date,

    // Эксперт по которому выбирать карты для проверки
    expert?: ExpertModel[],

    //Система по которой выбирать карты для проверки
    client?: ClientModel[],

    //Массив номеров карт
    nomers?: boolean,

    // Статус проверки: CREATED , STARTED , FINISHED, STOPPED
    status?: string,

    // Список проверяемых карт
    dks?: {

        // Номер карты
        nomer?: string,

        // Статус проверки карты: NOCHECK - не проверялась , ERR - не получилось проверить, MISS - отсутствует в еаисто , OK - есть в еаисто
        status?: string,

        // Карта
        dk?: DkModel
    }[],

    // Сообщение в ходе проверки
    console?: {
        date: Date,
        message: string
    }
}