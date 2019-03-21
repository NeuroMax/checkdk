import { SoapResponse } from "../../interfaces/soap-responce.interface";
import { Injector } from "../../utils/injector";
import { DkModel } from "../../models/dk.model";
import { IpModel } from "../../models/ip.model";
import { ExpertModel } from "../../models/expert.model";
import { Ip } from "../../schemas/ip.schema";
import { Drum } from "../check/drum";
import { Logger } from '../../../logger';

import * as fs from "fs";
import * as path from "path";
import * as request from "request";
import * as xml2js from "xml2js";
import * as handlebars from "handlebars";
import * as moment from "moment";

const logger = new Logger();

export class EaistoApi {
    private url: string = 'https://eaisto.gibdd.ru/common/ws/arm_expert.php?wsdl';
    private expert: ExpertModel;
    private ip: IpModel;
    private drum: Drum;

    private try: number = 0;
    private tryLimit: number = 4;

    constructor (expert: ExpertModel, ip: IpModel) {
        this.expert = expert;
        this.ip = ip;
        this.handlebarsHelpers();
        this.drum = new Drum();
    }

    //--------------------- Methods ------------------------

    /** 
     * Регистрация Карты
    */
   public async RegisterCard (dk: DkModel) {
        let url = this.url;
        let xmlFile;
        
        try {
            xmlFile = await this.getWsdlFile('register-card.xml', dk);
            var response = await this.send(xmlFile, url);
        } catch (error) {
            throw error;
        }

        return response;
    }

    public async GetCardByVin (
        vin: string,
        regNumber: string,
        bodyNumber: string,
        frameNumber: string,
        nomer: string
    ) {
        let url = this.url;

        let data = {
            name: this.expert.login,
            password: this.expert.password,
            vin,
            regNumber,
            bodyNumber,
            frameNumber,
            formNumber: nomer
        };

        try {
            let xmlFile = await this.getWsdlFile('get-card-by-vin.xml', data);
            var response = await this.send(xmlFile, url);
        } catch (error) {
            throw error;
        }

        return response;
    }

    //-----------------------------------------------

    /**
     * Отправка запроса
     * @param wsdl файл wsdl запроса
     */
    private send (wsdl: string, url: string): Promise<SoapResponse> {
        return new Promise(async (resolve, reject) => {

            try {
                var proxy = this.serializeIp(this.ip);
            } catch (error) {
                reject(error);
            }
    
            let options: any = {
                url,
                proxy,
                method: 'POST',
                body: wsdl,
                headers: {
                    'Content-Type' : 'text/xml'
                }
            };
            
            logger.regCardLog('EAISTO request', {
                proxy,
                expert: this.expert.login,
                body: wsdl
            });
    
            let callback = async (error, res, body) => {
                if (error) {
                    logger.regCardError('EAISTO response Error', {
                        error,
                        proxy,
                        body
                    });

                    if (error) {
                        // if (error.Error.indexOf('ECONNREFUSED') + 1 || error.Error.indexOf('ECONNRESET') + 1) {

                        // }
                        try {
                            await this.drum.disableIp(this.ip);
                        } catch (error) {
                            reject(error);
                        }
                    }

                    reject(error);

                    return;
                }
    
                try {
                    var parsed = await this.parseXml(body);
                } catch (error) {
                    reject(error);
                }

                logger.regCardLog('EAISTO response', {
                    status: res.statusCode,
                    body,
                    parsed: JSON.stringify(parsed)
                });
                
                resolve(parsed);
            };
    
            request(options, callback);
        });
    }

    /**
     * Генерация wsdl файла для запроса
     * @param fileName имя файла
     * @param data данные для вставки в файл
     */
    private async getWsdlFile (fileName: string, data: any) {
        let filePathXml = path.resolve(__dirname, '../../../../files/xml/' + fileName);

        try {
            var xml = await fs.readFileSync(filePathXml, 'utf-8');
        } catch (error) {
            throw error;
        }

        let template = handlebars.compile(xml);
        let result = template(data);

        return result;
    }

    //::::::::::::::::::::::::::::HELPERS::::::::::::::::::::::::::::::::::::::
    private serializeIp (ip: IpModel) {
        return `http://${ip.login}:${ip.password}@${ip.ip}:${ip.port}`;
    }

    private handlebarsHelpers () {
        handlebars.registerHelper('dateToIso', function(val: Date) {
            if (!val) return ''; 
            if (typeof val === "string") val = new Date(val);
            let m = moment(val);
            let date = m.format();
            return new handlebars.SafeString(date);
        });
    }

    /**
     * Парсинг xml ответа
     * @param xml строка ответа
     */
    private parseXml (xml: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let options = {
                explicitArray: false, 
                trim: true, 
                explicitRoot: false
            };

            let parser = new xml2js.Parser(options);
            parser.parseString(xml, (err, result) => {
                if (err) reject(err);
                resolve(this.processingResponse(result));
            });
        });
    }

    /**
     * Обработка полученного json ответа
     * @param data данные для обработки
     */
    private processingResponse (data: Object) {
        let body = data['SOAP-ENV:Body'];
        let result = getStructure(body);

        function getStructure (o: any) {

            if (Array.isArray(o)) {
                let arr = [];

                o.forEach(i => {
                    arr.push(getStructure(i));
                });

                return arr;
            } else if (o instanceof Object) {
                let keys = Object.keys(o);
                let obj = {};

                let new_keys = keys.map(val => {
                    let chunks = val.split(':');
                    let str = chunks.length === 1 ? chunks[0] : chunks[1];
                    str = str[0].toLowerCase() + str.substr(1);
                    return str;
                });

                for (let i = 0; i < keys.length; i++) {
                    obj[new_keys[i]] = getStructure(o[keys[i]]);
                }

                return obj;
            } else {
                return o;
            }
        }

        return result;
    }
}