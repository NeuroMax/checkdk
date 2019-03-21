export interface IDkData {

    //Кузов №
    bodyNumber?: string,

    //Дата диагностики (передавать при создании карточки не требуется)
    dateOfDiagnosis?: Date,

    //Для данного типа заполняется следующие поля: комментарий срок действия дубликат
    form?: {

        //Комментарий
        comment?: string,

        //Дубликат
        duplicate?: boolean,

        /*
        //Серия *(данные поля не передаются в метод RegisterCard)
        series: string,
        
        //Номер *(данные поля не передаются в метод RegisterCard)
        number: string,*/

        //Срок действия
        validity?: Date
    },

    //Фамилия лица, предоставившего ТС на осмотр
    name?: string,

    //Имя лица, предоставившего ТС на осмотр
    fName?: string,
    
    //Отчество лица, предоставившего ТС на осмотр
    mName?: string,

    //Замечания
    note?: string,

    //Государственный регистрационный знак
    registrationNumber?: string,

    //Результат проверки (Принимает одно из следующих значений: Passed – пройдена NotPassed – не пройдена)
    testResult?: string,

    //Вид проверки (Принимает одно из следующих значений: Primary – первичная Secondary – вторичная) 
    testType?: string,

    //Массив результатов диагностики
    values?: [{
        //Код диагностики 1-65
        code?: number,

        //Значение о возможности эксплуатации (0 – параметр соответствует требованиям 1 – параметр не соответствует требованиям)
        testResult?: number
    }],

    //Автомобиль
    vehicle?: {
        //Марка
        make?: string,

        //Модель
        model?: string
    },

    //Категория ТС (СРТС или ПТС)
    vehicleCategory?: string,

    //Категория ТС (ОКП)
    vehicleCategory2?: string,

    //VIN
    vin?: string,

    //Год выпуска ТС
    year?: number,

    //Шасси (Рама) №
    frameNumber?: string,

    //Масса без нагрузки (кг)
    emptyMass?: number,

    //Разрешенная максимальная масса (кг)
    maxMass?: number,

    //Тип топлива Принимает одно из следующих значений: 
    // Petrol – бензин 
    // Diesel – дизельное топливо 
    // PressureGas – сжатый газ 
    // LiquefiedGas – сжиженный газ 
    // None – Без топлива
    fuel?: string,

    //Тип привода тормозной системы Принимает одно из следующих значений:
    // Mechanical – механический
    // Hydraulic – гидравлический
    // Pneumatic – пневматический
    // Combined – комбинированный
    // None – Без тормозной системы
    brakingSystem?: string,

    //Марка шин
    tyres?: string,

    //Пробег ТС (км)
    killometrage?: number,

    //Регистрационный документ (обязательно)
    registrationDocument?: {

        //Тип регистрационного документа (RegTalon – Свидетельство  регистрации транспортного средства PTS – Паспорт транспортного средства)
        documentType?: string,

        //Серия
        series?: string,

        //Номер
        number?: string,

        //Выдан кем
        organization?: string,

        //Выдан когда
        date?: Date,

        //Собственник иностранный гражданин (Y/N/NULL)
        foreign?: string
    },

    //Эксперт (обязательно)
    expert?: {
        
        //Фамилия
        name?: string,

        //Имя
        fName?: string,

        //Отчество
        mName?: string
    },

    //Оператор (не обязательно)
    operator?: {

        //Полное наименование
        fullName?: string,

        //Сокращенное наименование
        shortName?: string
    }
}