export interface SoapResponse {

    listBrakingSystemResponse?: {
        listItem: [{ code: string, title: string }]
    },

    //Ответ регистрации карты
    registerCardResponse: {
        registerCardResult: number,
        nomer: string
    },

    //Ошибка
    fault?: {
        faultcode: string,
        faultstring: string
    }
}