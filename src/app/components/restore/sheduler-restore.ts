import { WebSocketService } from "../../services/web-socket.service";
import { CheckItem } from "../check/check-item";
import { RestoreItem } from "./restore-item";
import { Injector } from "../../utils/injector";

interface SOMessage {
    target?: string,
    action?: string,
    id?: string
}

export class ShedulerRestore {
    private ws: WebSocketService;
    private restores: RestoreItem[] = [];

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

            if (mes.target === 'restore') {
                if (mes.action === 'status') {
                    
                    this.ws.broadcast(JSON.stringify(response));
                }

                if (mes.action === 'start') {
                    await this.startRestore(mes.id);
                }

                if (mes.action === 'stop') {
                    await this.stopRestore(mes.id);
                }
            }
        });
    }

    //-----------------------------------------------------
    /**
     * Запуск восстановления
     * @param id 
     */
    private async startRestore (id: string) {
        let restore: RestoreItem = await this.getRestoreInstance(id);

        let res = await restore.start();

        this.removeRestore(id);
    }

    /**
     * Остановка восстановления
     * @param id 
     */
    private async stopRestore (id: string) {
        let restore: RestoreItem = await this.getRestoreInstance(id);
        await restore.stop();
        this.removeRestore(id);
    }

    //-----------------------------------------------------
    /**
     * Удаление проверки из стека
     * @param id 
     */
    private removeRestore (id: string) {
        for (let i = 0; i < this.restores.length; i++) {
            if (this.restores[i].id === id) {
                this.restores.splice(i, 1);
            }
        }
    }

    /**
     * Получение объекта проверки из массива
     * @param id 
     */
    private async getRestoreInstance (id: string) {
        let restore: RestoreItem;

        try {
            if (!this.issetSteckRestore(id)) {
                restore = await this.initRestoreItem(id);
            } else {
                restore = this.restores.find(c => c.id === id);
            }
        } catch (error) {
            throw error;
        }

        return restore;
    }

    /**
     * Проверка наличия проверки в массиве
     * @param id 
     */
    private issetSteckRestore (id: string) {
        let isset = false;

        for (let restore of this.restores) {
            if ( restore.id === id ) isset = true;
        }

        return isset;
    }

    private async initRestoreItem (id: string) {
        let restore: RestoreItem = await new RestoreItem(id);
        await restore.init();
        if (restore.getStatus().checkStatus != 'FINISHED') {
            this.restores.push(restore);
        }
        
        return restore;
    }
}