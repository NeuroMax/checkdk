import { UserModel } from "../../models/user.model";
import { ClientModel } from "../../models/client.model";
import { OtoModel } from "../../models/oto.model";
import { ExpertModel } from "../../models/expert.model";
import * as moment from "moment";
import { Expert } from "../../schemas/expert.schema";
import { Dk } from "../../schemas/dk.schema";
import { User } from "../../schemas/user.schema";
import { Oto } from "../../schemas/oto.schema";
import { IpModel } from "../../models/ip.model";
import { Ip } from "../../schemas/ip.schema";
import { DkModel } from "../../models/dk.model";

export class DrumRestore {
    private useExperts: ExpertModel[] = [];
    private expertsOrder = 0;

    constructor (useExperts?: ExpertModel[]) {
        if (useExperts) this.useExperts = useExperts;
    }

    private send_frequency = 900; //in miliseconds
    
    /**
     * Получение эксперта
     * @param category категория аккредитации
     * @param regNumber гос номер ТС
     */
    async getExpert (dk: DkModel): Promise<ExpertModel> {

        let category: string = dk.data.vehicleCategory,
        regNumber: string = dk.data.registrationNumber,
        user: UserModel = dk.who_created,
        client: ClientModel = dk.client;

        if (this.useExperts.length) {
            if (this.expertsOrder >= this.useExperts.length) this.expertsOrder = 0;
            let expert = this.useExperts[this.expertsOrder];
            this.expertsOrder++;
            return expert;
        };

        try {
            var operators: OtoModel[] = await this.getOperators(user, client);
        } catch (error) {
            throw error;
        }

        let experts: ExpertModel[] = [];
        let regCode = regNumber ? this.getRegionByRegNomer(regNumber) : 0;

        if (!regCode) regCode = 0;
        
        for (let op of operators) {
            let arr: ExpertModel[] = [];

            let lastUseDate = moment().subtract(this.send_frequency, 'milliseconds');

            //Выбираем экспертов текущей системы
            let query = {
                enabled: true,
                use_in_restore: true,
                oto: op,
                apiProvider: 'eaisto',
                apps: { $in: [client] },
                categories: { $in: [category] },
                regions: { $elemMatch: { code: regCode } },
                $or: [{ lastUse: { $lte: lastUseDate} }, { lastUse: { $exists: false } }]
            };
            

            try {
                arr = await Expert.find(query)
                    .populate('oto');
            } catch (error) {
                throw error;
            }

            
            experts = experts.concat(arr);
        }
        
        if (!experts.length) {
            throw { message: 'Нет экспертов (first test)' };
        }
        
        experts = experts.sort(sortExpertsByPriority);

        function sortExpertsByPriority (a: ExpertModel, b: ExpertModel) {
            return b.priority - a.priority;
        }

        //Отфильтровываем достигших дневного лимита
        let filterLimit = (experts: ExpertModel[]): Promise<ExpertModel[]> => new Promise(async (resolve, reject) => {

            let arr: ExpertModel[] = [];

            for (let e of experts) {
                try {
                    var count = await this.getCountDkCurrentDay(e);
                } catch (error) {
                    throw error;
                }

                if (count < e.dk_limit) arr.push(e);
            }

            resolve(arr);
        });

        //Проверка разрешенных логинов
        let filterAllowed = (experts: ExpertModel[]): Promise<ExpertModel[]> => new Promise(async (resolve, reject) => {

            let arr: ExpertModel[] = [];

            for (let e of experts) {
                let accept = false;
    
                if (!e.allowed || e.allowed.length === 0) accept = true;
                else {
                    for (let login of e.allowed) {
                        if (login == user.login) {
                            accept = true;
                            break;
                        } else {
    
                            try {
                                var u: UserModel = await User.findOne({ login });
                                if (!u) continue;

                                var structure: UserModel[] = await this.getUsersByStructure(u, client);
                            } catch (error) {
                                reject(error);
                            }
                            
                            if (structure && structure.length > 0) {
                                for (let s of structure) {
                                    if (s.login === user.login) {
                                        accept = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                if (accept) arr.push(e);
            }

            resolve(arr);
        });

        try {
            experts = await filterLimit(experts);
            experts = await filterAllowed(experts);
        } catch (error) {
            throw error;
        }

        if (!experts.length) throw { message: 'Нет экспертов' };

        return experts[0];
    }

    /** 
     * Получение Ip
    */
    async getIp () {

        try {
            var ips: IpModel[] = await Ip.find({ enabled: true }).sort('lastUse');
        } catch (error) {
            throw error;
        }

        if (!ips || ips.length === 0) throw { message: 'Нет Ip' };

        let ip = ips[0];

        try {
            await ip.update({ lastUse: new Date() });
        } catch (error) {
            throw error;
        }

        return ip;
    }

    /**
     * Получение операторов 
     * @param user пользователь
     */
    private async getOperators (user: UserModel, client: ClientModel): Promise<OtoModel[]> {
        let operators: OtoModel[] = [];
        
        try {
            user = await User.findById(user._id).populate('settings.operators');
        } catch (error) {
            throw error;
        }
        
        if (!user.settings.operators || !user.settings.operators.length) {
            
            try {
                if (user.owner) {
                    let id = user.owner.toString();
                    let owner = await User.findById(id);

                    if (owner) {
                        operators = await this.getOperators(owner, client);
                    }
                }
            } catch (error) {
                throw error;
            }
            
        } else {
            operators = user.settings.operators.filter(item => {
                for (let c of item.clients) {
                    if (String(c._id) == String(client._id)) return true;
                }

                return false;
            });
        }

        if (!operators.length) {
            try {
                operators = await Oto.find({ show_in_list: true, clients: { $in: [client] } });
            } catch (error) {
                throw error;
            }
        }
    
        return operators;
    }

    /**
     * Функция возвращает количество созданных карт за текущий день
     * @param expert 
     */
    private async getCountDkCurrentDay (expert: ExpertModel): Promise<number> {
        let now = new Date();
        let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,1);

        let query = { 
            expert, 
            draft: false, 
            status: true,
            $or: [{ deleted: false}, { deleted: { $exists: false } }],
            dateReceiving: { $gte: start, $lte: now },
            nomer: { $exists : true }
        };

        try {
            var count: number = await Dk.find(query).count();
        } catch (error) {
            throw error;
        }

        return count;
    }

    /**
     * Функция возвращает структуру пользователей у конкретного пользователя
     * @param user пользователь
     */
    private async getUsersByStructure (user: UserModel, client: ClientModel): Promise<UserModel[]> {

        async function getChilds(users: UserModel[], list: Array<UserModel>): Promise<void> {

            let usersId = [];

            for (let user of users) {
                usersId.push(user._id);
            }

            let options = { 
                owner: { $in : usersId }, 
                _deleted: false, 
                locked: false, 
                app_client: { $in: [client] }, 
                roles: { $in: ['ROLE_OTO', 'ROLE_BROKER', 'ROLE_AGENT'] } 
            };

            try {
            
                var childs: UserModel[] = await User.find(options).sort('-date_create');

                if (childs && childs.length > 0) {
                    list.push(...childs);
                    await getChilds(childs, list);
                }    
            } catch (error) {
                throw error;
            }

        }

        var list: UserModel[] = [];  
        
        await getChilds([user], list);
        
        return list;
    }
    
    /**
     * Получение региона по гос номеру
     * @param regNomer гос номар ТС
     */
    private getRegionByRegNomer (regNomer: string): number {
        let str = regNomer.match(/\d+/g).map(Number);
        return +str[1];
    }
}