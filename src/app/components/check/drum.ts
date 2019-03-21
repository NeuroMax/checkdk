import { ExpertModel } from "../../models/expert.model";
import { Expert } from "../../schemas/expert.schema";
import { IpModel } from "../../models/ip.model";
import { Ip } from "../../schemas/ip.schema";
import * as moment from "moment";

export class Drum {

    constructor () {}

    private experts: ExpertModel[] = [];
    private ips: IpModel[] = [];

    private expertOrder: number = 0;
    private ipOrder: number = 0;

    async init () {
        try {
            await this.getAllExperts();
            await this.getAllIp();
        } catch (error) {
            throw error;
        }
    }

    async getExpert () {
        // if (this.expertOrder >= this.experts.length) {
        //     this.expertOrder = 0;
        // }

        let send_frequency = 11000;
        let now = new Date();

        let lastUseDate = moment().subtract(send_frequency, 'milliseconds');

        let query = {
            use_in_check: true,
            apiProvider: 'eaisto',
            enabled: true,
            $or: [{ lastUse: { $lte: lastUseDate} }, { lastUse: { $exists: false } }]
        };

        try {
            var experts: ExpertModel[] = await Expert.find(query).sort('-priority');
        } catch (error) {
            throw error;
        }

        // let experts = this.experts.filter(item => {
        //     let lastUse = new Date(item.lastUse);
            
        //     if (!lastUse) return true;

        //     if ((now.valueOf() - lastUse.valueOf()) > send_frequency) {
        //         return true;
        //     }

        //     return false;
        // });

        let expert: ExpertModel = experts[0];
        if (expert) {
            await expert.update({ lastUse: now });
            console.log('Get expert', expert.login);
        }

        // try {
        //     await this.getAllExperts();
        // } catch (error) {
        //     throw error;
        // }

        if (!expert) throw { message: 'Нет экспертов' };

        // this.expertOrder++;

        return expert;
    }

    async getIp () {
        // if (this.ipOrder >= this.ips.length) {
        //     this.ipOrder = 0;
        // }

        let send_frequency = 11000;
        let now = new Date();
        let lastUseDate = moment().subtract(send_frequency, 'milliseconds');

        let query = {
            enabled: true,
            $or: [{ lastUse: { $lte: lastUseDate} }, { lastUse: { $exists: false } }]
        };

        try {
            var ips: IpModel[] = await Ip.find(query);
        } catch (error) {
            throw error;
        }

        // let ips = this.ips.filter(item => {
        //     let lastUse = new Date(item.lastUse);

        //     if (!lastUse) return true;

        //     if ((now.valueOf() - lastUse.valueOf()) > send_frequency) {
        //         return true;
        //     }

        //     return false;
        // });

        let ip: IpModel = ips[0];

        if (ip) {
            await Ip.update({ _id: ip._id }, { lastUse : now });
            console.log('Get ip', ip.ip);
        }

        // try {
        //     await this.getAllIp();
        // } catch (error) {
        //     throw error;
        // }

        if (!ip) throw { message: 'Нет ip' };

        // this.ipOrder++;

        return ip;
    }

    async disableIp (ip: IpModel) {

        console.log('Disable ip::::', ip.ip);

        try {
            await ip.update({ enabled: false });
        } catch (error) {
            throw error;
        }

        for (let i = 0; i < this.ips.length; i++) {
            if (this.ips[i].ip === ip.ip) {
                this.ips.splice(i, 1);
            }
        }
    }

    async disableExpert (expert: ExpertModel) {
        try {
            await expert.update({ enabled: false });
        } catch (error) {
            throw error;
        }

        console.log('Disable expert::::', expert.login);

        for (let i = 0; i < this.experts.length; i++) {
            if (this.experts[i].login === expert.login) {
                this.experts.splice(i, 1);
            }
        }
    }

    private async getAllExperts () {

        let query = {
            use_in_check: true,
            apiProvider: 'eaisto',
            enabled: true
        };

        try {
            var experts: ExpertModel[] = await Expert.find(query).sort('-priority');
        } catch (error) {
            throw error;
        }

        this.experts = experts;
    }

    private async getAllIp () {
        let query = {
            enabled: true
        };

        try {
            var ips: IpModel[] = await Ip.find(query);
        } catch (error) {
            throw error;
        }

        this.ips = ips;
    }

}