import { Inject, Injector } from "../../utils/injector";
import { WebSocketService } from "../../services/web-socket.service";
import { CheckItem } from "./check-item";

interface SOMessage {
    target?: string,
    action?: string,
    id?: string
}

@Inject
export class Sheduler {

    private ws: WebSocketService;
    private checks: CheckItem[] = [];

    constructor () {
        this.ListenSocket();
    }

    /**
     * Прослушивание сокета
     */
    private async ListenSocket () {
        this.ws = Injector.get(WebSocketService);

        this.ws.subject.subscribe(async message => {
            let mes: SOMessage = JSON.parse(message as string);
            let response: any;

            if (mes.target === 'check') {
                if (mes.action === 'status') {
                    response = await this.getStatus(mes.id);
                    this.ws.broadcast(JSON.stringify(response));
                }

                if (mes.action === 'start') {
                    await this.startCheck(mes.id);
                }

                if (mes.action === 'stop') {
                    await this.stopCheck(mes.id);
                }

            }
        });
    }

    /**
     * Запуск проверки
     * @param id 
     */
    private async startCheck (id: string) {
        let check: CheckItem = await this.getCheckInstance(id);

        let res = await check.start();

        if (res) this.removeCheck(id);
    }

    /**
     * Остановка проверки
     * @param id 
     */
    private async stopCheck (id: string) {
        let check: CheckItem = await this.getCheckInstance(id);
        await check.stop();
        this.removeCheck(id);
    }

    /**
     * Получение статуса проверки
     * @param id 
     */
    private async getStatus (id: string) {
        try {
            var check: CheckItem = await this.getCheckInstance(id);
        } catch (error) {
            throw error;
        }

        let res = this.serializeStatus(check);

        return res;
    }

    /**
     * Удаление проверки из массива
     * @param id 
     */
    private removeCheck (id: string) {
        for (let i = 0; i < this.checks.length; i++) {
            if (this.checks[i].id === id) {
                this.checks.splice(i, 1);
            }
        }
    }

    /**
     * Получение объекта проверки из массива
     * @param id 
     */
    private async getCheckInstance (id: string) {
        let check: CheckItem;

        try {
            if (!this.issetCheck(id)) {
                check = await this.initCheck(id);
            } else {
                check = this.checks.find(c => c.id === id);
            }
        } catch (error) {
            throw error;
        }

        return check;
    }

    /**
     * Инициализация проверки
     * @param id 
     */
    private async initCheck (id: string) {
        let check: CheckItem = await new CheckItem(id);
        await check.init();
        if (check.getStatus().checkStatus != 'FINISHED') {
            this.checks.push(check);
        }
        
        return check;
    }

    /**
     * Проверка наличия проверки в массиве
     * @param id 
     */
    private issetCheck (id: string) {
        let isset = false;

        for (let check of this.checks) {
            if ( check.id === id ) isset = true;
        }

        return isset;
    }


    /**
     * Ответ для запроса статуса
     * @param check 
     */
    private serializeStatus (check: CheckItem) {
        let response = {
            id: check.id,
            ...check.getStatus()
        };

        return response;
    }

}