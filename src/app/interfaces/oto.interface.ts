import { ClientModel } from "../models/client.model";

export interface IOto {
    //Наименование организации
    name?: string,

    //Наименование в списке приоритетных операторов 
    name_list?: string,

    //Логин
    login?: string,

    //Пароль
    password?: string,

    //Адрес организации 
    address?: string,

    //Адрес (фактический). Заполнять в случае если основной адрес - нереальный 
    fact_address?: string,

    //ИНН
    inn?: string,

    //КПП
    kpp?: string,

    //Банк
    bank?: string,

    //Бик
    bik?: string,

    //Расчетный счет
    checking_account?: string,

    // Кор счет
    kor_account?: string,

    //Номер в реестре (OTO)
    oto_number?: string,

    //Показывать в списке приоритетных операторов 
    show_in_list?: boolean

    //Область аккредитации (Категория ТС: например L, M1, M2, N1)
    categories?: string[],

    //Системы
    clients?: ClientModel[]
}