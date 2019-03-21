import { WebSocketService } from "../../services/web-socket.service";
import { Injector } from "../../utils/injector";
import { DrumRestore } from "./drum-restore";
import { RestoreModel } from "../../models/restore.model";
import { Restore } from "../../schemas/restore.schema";
import { DkModel } from "../../models/dk.model";
import { EaistoApi } from "../api/eaisto.api";
import { RestoreResponseHandler } from "./restore-response.handler";
import * as moment from "moment";

interface DkItem {
    nomer: string,
    status: string,
    dk: DkModel
}

export class RestoreItem {
    private ws: WebSocketService;
    private drum: DrumRestore;
    private restore: RestoreModel;
    private exit: boolean = false;

    id: string;
    restoreStatus: string;
    console: { date: Date, message: string }[] = [];

    restored: number = 0;
    unsuccessful: number = 0;
    noRestored: number = 0;
    summAttempt: number = 0;
    progress: number = 0;

    constructor (id: string) {
        this.ws = Injector.get(WebSocketService);
        this.drum = new DrumRestore();
        this.id = id;
    }

    async init () {
        if (!this.restore) {
            try {
                var restore: RestoreModel = await Restore.findById(this.id)
                    .populate('experts')
                    .populate('dks.dk');
            } catch (error) {
                throw error;
            }

            if (!restore) throw { message: 'Нет восстановления с таким id' };

            this.restore = restore;

            await this.serializeMonitoringData(restore);
        }
    }

    //------------------------------------------------------------

    //TODO:
    getStatus () {
        let status: any = {

        }

        return status;
    }

    async start () {
        let message;
        this.exit = false;
        
        let upd: any = {
            status: 'STARTED'
        };

        if (this.restoreStatus === "CREATED") {
            upd.startCheck = new Date();
        };

        this.restoreStatus = 'STARTED';

        try {
            await this.restore.update(upd);
        } catch (error) {
            throw error;
        }

        for (let item of this.restore.dks) {
            if (this.exit) break;

            if (item.status === "NOCHECK" || item.status === "ERR") {

                //Проверка просрочена карта или нет
                if (!this.checkDkOverdue(item.dk)) {
                    console.log('Карта просрочена', item.dk._id); //TODO: добавить сообщение в this.console
                    continue;
                }

                try {
                    var res = await this.send(item);
                } catch (error) {
                    throw error;
                }


            }
        }
    }

    //TODO:
    private async send (item: DkItem) {
        let drum: DrumRestore;
        
        if (this.restore.experts) drum = new DrumRestore(this.restore.experts);
        else drum = new DrumRestore();
        
        try {
            var proxy = await drum.getIp();
            var expert = await drum.getExpert(item.dk);
        } catch (error) {
            throw error;
        }
        
        let api: EaistoApi = new EaistoApi(expert, proxy);

        try {
            var response = await api.RegisterCard(item.dk);
        } catch (error) {//Возможные ошибки: ip, парсинг xml
            await this.resultHandle({ err: error }, item);
        }

        api = undefined;

        try {
            var result = await RestoreResponseHandler.handle(response);
        } catch (error) { //Возможные ошибки: ответ еаисто (параметр FAULT);
            await this.resultHandle({ err: error }, item);
        }

        if (result) {
            await this.resultHandle({ success: result }, item);
        }
    }

    /**
     * Обработка результата ответа
     */
    //TODO:
    private async resultHandle (res: { err?, success? }, item: DkItem) {

        if (res.err) {
            this.console.push({
                date: new Date(),
                message: res.err.message
            });
        }

        
    }

    /**
     * Остановка восстановления
     */
    async stop () {
        this.restoreStatus = 'STOPPED';
        this.exit = true;

        try {
            await this.restore.update({ status: 'STOPPED' });
        } catch (error) {
            throw error;
        }

        this.report();
    }


    //-----------------------------------------------------------
    //TODO:
    private report () {
        let message = {
            target: 'restore',
            id: this.id
            // checkStatus: this.checkStatus,
            // checked: this.checked,
            // miss: this.miss,
            // noChecked: this.noChecked,
            // summChecked: this.summChecked,
            // progress: this.progress
        };

        this.ws.broadcast(message);
    }

    //TODO:
    private calculate () {
        // this.summChecked = this.miss + this.checked + this.noChecked;
        // this.progress = Math.round((this.summChecked / this.check.dks.length) * 100);
    }

    private async serializeMonitoringData (restore: RestoreModel) {
        this.console = restore.console;

        for (let r of restore.dks) {
            if (r.status === 'ERR') this.unsuccessful++;
            if (r.status === 'NORESTORE') this.noRestored++;
            if (r.status === 'OK') this.restored++;
        }

        this.restoreStatus = restore.status;
        this.summAttempt = this.unsuccessful + this.restored;
        this.progress = Math.round((this.summAttempt / restore.dks.length) * 100);
    }

    /**
     * Пауза
     * @param ms время в мс
     */
    private pause (ms: number) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    /**
     * Проверка на просроченность
     * @param dk 
     */
    private checkDkOverdue (dk: DkModel) {
        let now = new Date();
        let validity = new Date(dk.data.form.validity);

        if (now.valueOf() < validity.valueOf()) {
            return false;
        }

        return true;
    }
}