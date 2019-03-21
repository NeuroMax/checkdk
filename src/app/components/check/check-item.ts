import { CheckModel } from "../../models/check.model";
import { Check } from "../../schemas/check.schema";
import { WebSocketService } from "../../services/web-socket.service";
import { Injector } from "../../utils/injector";
import { EaistoApi } from "../api/eaisto.api";
import { Drum } from "./drum";
import { DkModel } from "../../models/dk.model";
import { CheckResponseHandler } from "./check-response.handler";
import { Logger } from "../../../logger";
const logger = new Logger();

export class CheckItem {
    private ws: WebSocketService;
    private check: CheckModel;
    private drum: Drum;
    
    private checkStatus: string;
    private checked: number = 0;
    private miss: number = 0;
    private noChecked: number = 0;
    private summChecked: number = 0;
    private progress: number = 0;


    private ipFrequency: number = 900;
    private expertFrequency: number = 10000;
    private interval;
    private exit: boolean = false;
    private sendAttempt: number = 0;
    private sendCount: number = 6;

    id: string;

    constructor (id: string) {
        this.ws = Injector.get(WebSocketService);
        this.drum = new Drum();
        this.id = id;
    }

    async init () {
        if (!this.check) {
            try {
                var check: CheckModel = await Check.findById(this.id)
                    .populate('dks.dk');
            } catch (error) {
                throw error;
            }

            if (!check) throw { message: 'Нет проверки с таким id' };

            this.check = check;

            await this.serializeData(check);
        }

        await this.drum.init();
    }

    async start () {
        let message;

        if (this.summChecked == this.check.dks.length) {
            console.log('Finish');
    
            this.checkStatus = 'FINISHED';
    
            try {
                await this.check.update({ status: 'FINISHED' });
            } catch (error) {
                throw error;
            }
    
            this.report();

            return true;
        }

        this.exit = false;
        
        let upd: any = {
            status: 'STARTED'
        };

        if (this.checkStatus === "CREATED") {
            upd.startCheck = new Date();
        };

        this.checkStatus = 'STARTED';

        try {
            await this.check.update(upd);
        } catch (error) {
            throw error;
        }
        
        for (let dk of this.check.dks) {
            if (this.exit) break;

            if (dk.status === "NOCHECK" || dk.status === "ERR") {
                let status;
                
                try {
                    var res: boolean = await this.send(dk.nomer);

                    if (res) {
                        status = 'OK';
                        this.checked++;
                    } else {
                        status = 'MISS';
                        this.miss++;
                    }
                } catch (error) {
                    status = 'ERR';
                    this.noChecked++;
                    console.log('Start error', error);
                }
                

                try {
                    await this.saveProgress(dk.nomer, status);
                } catch (error) {
                    throw error;
                }
                
                
                this.calculate();
                this.report();
                
                await this.pause(this.expertFrequency);
            }

        }
        
        if (this.summChecked == this.check.dks.length) {
            console.log('Finish');
    
            this.checkStatus = 'FINISHED';
    
            try {
                await this.check.update({ status: 'FINISHED' });
            } catch (error) {
                throw error;
            }
    
            this.report();
        }
        
        return true;
    }

    async stop () {
        this.checkStatus = 'STOPPED';
        this.exit = true;

        try {
            await this.check.update({ status: 'STOPPED' });
        } catch (error) {
            throw error;
        }

        this.report();
    }

    getStatus () {
        let status = {
            checkStatus: this.checkStatus,
            checked: this.checked,
            miss: this.miss,
            noChecked: this.noChecked,
            summChecked: this.summChecked,
            progress: this.progress
        };

        return status;
    }

    private async send (nomer: string) {
        try {
            var expert = await this.drum.getExpert();
            var ip = await this.drum.getIp();
        } catch (error) {
            throw error;
        }
        
        let api = new EaistoApi(expert, ip);
        console.log('Iteration', expert.login, ip.ip);

        try {
            logger.checkCardLog('Send check', { dk: nomer }); //LOG

            var response = await api.GetCardByVin('', '', '', '', nomer || '');

            logger.checkCardLog('Response check', { dk: nomer, response: JSON.stringify(response) }); //LOG
        } catch (error) {
            this.sendAttempt++;

            if (this.sendAttempt <= this.sendCount) {
                await this.pause(1000);
                return await this.send(nomer);
            } else {
                throw error;
            }
        }

        api = undefined;
        let err;

        try {
            var result = await CheckResponseHandler.handle(response);
        } catch (error) {
            err = error;
        }

        if (err) {
            logger.checkCardError('Error response---------------', { err, expert: expert.login, ip: ip.ip }); //Log

            if (err.code) {

                if (err.code === 'USER_AUTH' || err.code === 'OPERATOR_V_CHS') {
                    await this.drum.disableExpert(expert);
                    console.log('Expert disabled:', expert.login);
                    await this.pause(this.expertFrequency);

                    try {
                        return await this.send(nomer);
                    } catch (error) {
                        throw error;
                    }

                } else {
                    throw err;
                }

            } else {
                throw err;
            }

        }

        console.log('Result', result);

        if (!result) return false;

        return true;
    }

    private async saveProgress (nomer: string, status: string) {
        let dks = this.check.dks.map(dk => {
            if (nomer === dk.nomer) {
                dk.status = status;
            }

            return dk;
        });

        this.check.dks = dks;

        try {
            await this.check.update({ dks })
        } catch (error) {
            throw error;
        }
    }

    //-----------------------------------------------

    private report () {
        let message = {
            target: 'check',
            id: this.id,
            checkStatus: this.checkStatus,
            checked: this.checked,
            miss: this.miss,
            noChecked: this.noChecked,
            summChecked: this.summChecked,
            progress: this.progress
        };

        this.ws.broadcast(JSON.stringify(message));
    }

    private calculate () {
        this.summChecked = this.miss + this.checked + this.noChecked;
        this.progress = Math.round((this.summChecked / this.check.dks.length) * 100);
    }

    private async serializeData (check: CheckModel) {
        for (let ch of check.dks) {
            if (ch.status === 'ERR') this.noChecked++;
            if (ch.status === 'MISS') this.miss++;
            if (ch.status === 'OK') this.checked++;
        }

        this.checkStatus = check.status;
        this.summChecked = this.miss + this.checked + this.noChecked;
        this.progress = Math.round((this.summChecked / check.dks.length) * 100);
    }

    private pause (ms: number) {
        return new Promise((resolve, reject) => {
            let t = setTimeout(() => {
                clearTimeout(t);
                resolve();
            }, ms);
        });
    }
}