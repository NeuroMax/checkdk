import { ClientModel } from "../models/client.model";
import { UserModel } from "../models/user.model";
import { OtoModel } from "../models/oto.model";

export interface IUser {

    //id со старой системы
    old_id?: number,

    //Логин
    login?: string,

    //Имя
    f_name?: string,

    //Фамилия
    name?: string,

    //Телефон
    phone?: string,

    //Email
    email?: string,

    //Skype
    skype?: string,

    //Пароль
    password?: string,

    //Роли
    roles?: string[],

    //Приложение (клиент) к которому привязан пользователь
    app_client?: ClientModel[],

    //"Родитель" пользователя в структуре
    owner?: UserModel,

    //Дата создания
    date_create?: Date,

    //Последний визит
    last_visit?: Date,

    //Цена ДК
    price_dk?: number,

    //Период оплаты (0 - 1 раз в неделю, 1 - 2 раза в мес., 2 - 1 раз в мес.)
    payment_period?: number,

    //Лимит на задолженность
    debt_limit?: number,

    //Оператор и юр. адрес в шапке ДК
    opAddress?: string,

    //Адрес пункта ТО
    address?: string,
    
    //Включен или нет пользователь
    enabled?: boolean,

    // Заблокирован или нет
    locked?: boolean,
    
    //Заметка
    note?: string,

    //Название изображения аватара
    avatar: string,

    //Поставщик
    provider?: boolean,

    //Удален
    _deleted?: Boolean,

    //Настройки
    settings?: {
        //Приоритетные операторы
        operators?: OtoModel[]
    }
}