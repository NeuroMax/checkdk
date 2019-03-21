import { UserModel } from "../models/user.model";
import { OtoModel } from "../models/oto.model";
import { IRegion } from "./region.interface";
import { ClientModel } from "../models/client.model";

export interface IExpert {
    //Логин ЕАИСТО
    login?: string,

    //Пароль
    password?: string,

    //Лимит
    dk_limit?: number,

    //Цена карты 
    dk_price?: number,

    //Приоритет
    priority?: number,

    //Использовать в проверке 
    use_in_check?: boolean,

    //Использовать в восстановлении 
    use_in_restore?: boolean,

    //Владелец
    owner?: UserModel,

    //ОТО
    oto?: OtoModel,

    //Категоррии (область аккредитации)
    categories?: string[],

    //Имя
    f_name?: string,

    //Фамилия
    name?: string,

    //Отчество
    s_name?: string,

    //Наименование организации
    organization?: string,

    //Адрес пункта
    address?: string,

    //Адрес пункт (фактический). Заполнять в случае если основной адрес - нереальный 
    fact_address?: string,

    //Номер
    number?: number,

    //Регионы
    regions?: IRegion[],

    //Системы
    apps?: ClientModel[],

    //Апи через который получает карты (eaisto, smartdk)
    apiProvider?: string,

    //Разрешенные логины
    allowed?: string[],

    //Дата последнего использования
    lastUse?: Date,

    //Включен
    enabled?: Boolean
}