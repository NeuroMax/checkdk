import { IDkData } from "./dk-data.interface";
import { UserModel } from "../models/user.model";
import { ClientModel } from "../models/client.model";
import { ExpertModel } from "../models/expert.model";

export interface IDk {

    //Пользователь создавший карту
    who_created?: UserModel,

    //Приложение (Клиент)
    client?: ClientModel,

    //Уникальный номер карточки в системе
    registerCardResult?: number,

    // Номер Диагностической карты
    nomer?: string,

    //Номер оффлайн
    offlineNomer?: string,

    //Признак того, что на данную карточку выдан дубликат (0 – на карточку нет дубликата 1 – на карточку есть дубликат)
    isArchive?: number,

    //Повторный технический осмотр пройти до
    dateOfRetest?: Date,

    // Статус (получена или нет)
    status?: boolean,
    
    //Дата создания карты
    dateCreate?: Date,

    //Дата получения
    dateReceiving?: Date,

    //Цена продажи карты, Руб
    selling_price?: number,

    //Черновик
    draft?: boolean,

    //Эксперт
    expert?: ExpertModel,
    
    // Данные карты
    data?: IDkData,

    //Название файла pdf
    pdf?: string,

    //Проверка карты
    test?: {
        status?: boolean,
        use?: boolean,
        date?: Date,
        response?: Object
    },

    //шапка из smartDk
    header?: {
        code?: string,
        name?: string,
        address?: string
    },
    
    //Удалена ли нет
    deleted?: boolean
}