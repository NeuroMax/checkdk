import { DkModel } from "../../models/dk.model";
import { Dk } from "../../schemas/dk.schema";
import { ICheck } from "../../interfaces/check.interface";
import { ExpertModel } from "../../models/expert.model";
import { Expert } from "../../schemas/expert.schema";
import { ClientModel } from "../../models/client.model";
import { Client } from "../../schemas/client.schema";
import { CheckModel } from "../../models/check.model";
import { Check } from "../../schemas/check.schema";
import * as moment from "moment";
import * as xl from "excel4node";
import * as path from 'path';

export class CheckService {

    static async create (expert: ExpertModel[], client: ExpertModel[], start: Date, end: Date, nomers?: Array<string>) {

        let query: any = {};
        let check: any = {
            chkId: await CheckService.getCheckId(),
            start,
            end,
            dks: []
        };

        if (nomers && nomers.length) {
            for (let nomer of nomers) {
                check.dks.push({
                    nomer
                });
            };
            check.nomers = true;
        } else {
            start = new Date(start);
            end = new Date(end);
            
            query = {
                dateReceiving: { $gte : start, $lte: end },
                deleted: false,
                status: true,
                draft: false,
                nomer: { $exists: true }
            };

            if (expert && expert.length) {

                try {
                    var exp: ExpertModel[] = await Expert.find({ _id: { $in: expert } });
                } catch (error) {
                    throw error;
                }
    
                query.expert = { $in: expert };
                check.expert = exp;
            }
    
            if (client && client.length) {
    
                try {
                    var cli: ClientModel[] = await Client.find({ _id: { $in: client } });
                } catch (error) {
                    throw error;
                }
    
                query.client = { $in: client };
                check.client = cli;
            }

            try {
                var dks: DkModel[] = await Dk.find(query);
            } catch (error) {
                throw error;
            }

            if (!dks.length) throw { message: 'По заданным параметрам карт нет!' };
    
            for (let dk of dks) {
                check.dks.push({
                    nomer: dk.nomer,
                    dk
                });
            };
        }

        try {
            var chk = await Check.create(check);
        } catch (error) {
            throw error;
        }

        return chk;
    }

    /**
     * 
     * @param skip 
     * @param limit 
     */
    static async getAll (skip: number, limit: number) {

        try {
            var count: number = await Check.find().count();
            var checks: CheckModel[] = await Check.find().skip(+skip).limit(+limit).sort('-dateCreate')
                .populate('expert')
                .populate('client');
        } catch (error) {
            throw error;
        }

        let result = {
            data: checks,
            count
        };

        return result;
    }

    /**
     * 
    */
    static async remove (_id: string) {
        try {
            await Check.remove({ _id });
        } catch (error) {
            throw error;
        }

        return;
    }

    /**
     * 
    */
    static async getById (id: string) {
        try {
            var check: CheckModel = await Check.findById(id)
                .populate('expert')
                .populate('client');
        } catch (error) {
            throw error;
        }

        return check;
    }

    /**
     * 
    */
    static async getXls (id: string) {

        try {
            var check: CheckModel = await Check.findById(id)
                .populate('expert')
                .populate('client')
                // .populate('dks.dk')
                .populate({
                    path: 'dks.dk',
                    populate: {
                        path: 'expert',
                        model: 'Expert'
                    }
                });
        } catch (error) {
            throw error;
        }

        if (!check) throw { message: 'Не найдена проверка' };

        let wb = new xl.Workbook();
        let ws = wb.addWorksheet('Лист 1', {
            printOptions: {
                centerHorizontal: true,
                printGridLines: true
            },
            margins: { // Accepts a Double in Inches
                bottom: 0.4,
                left: 0.4,
                right: 0.4,
                top: 0.4
            },
            pageSetup: {
                orientation: 'portrait',
                paperHeight: '297mm',
                paperWidth: '210mm'
            }
        });

        // Create a reusable style

        let styleHead = wb.createStyle({
            font: {
                size: 11
            },
            alignment : {
                wrapText: true
            }
        });

        let style = wb.createStyle({
            font: {
                size: 10
            },
            alignment : {
                wrapText: true
            }
        });

        let style2 = wb.createStyle({
            font: {
                size: 10,
                color: '#FF0800'
            },
            alignment : {
                wrapText: true
            }
        });
        
        ws.column(1).setWidth(3);
        ws.column(2).setWidth(17);
        ws.column(3).setWidth(17);
        ws.column(4).setWidth(17);
        ws.column(5).setWidth(17);
        ws.column(6).setWidth(17);
        ws.column(7).setWidth(17);
        ws.column(8).setWidth(17);
        ws.column(9).setWidth(17);
        ws.column(10).setWidth(17);

        ws.cell(1, 1).string('#').style(styleHead);
        ws.cell(1, 2).string('Номер карты').style(styleHead);
        ws.cell(1, 3).string('Наличие в ЕАИСТО').style(styleHead);
        ws.cell(1, 4).string('Эксперт').style(styleHead);
        ws.cell(1, 5).string('Организация').style(styleHead);
        ws.cell(1, 6).string('VIN номер').style(styleHead);
        ws.cell(1, 7).string('Гос номер').style(styleHead);
        ws.cell(1, 8).string('Номер кузова').style(styleHead);
        ws.cell(1, 9).string('Номер шасси').style(styleHead);
        ws.cell(1, 10).string('Дата создания').style(styleHead);

        for (let i = 0; i < check.dks.length; i++) {
            let n = 2;
            let isset: string = '';

            let vin = '';
            let nomer = '';
            let regNumber = '';
            let bodyNumber = '';
            let frameNumber = '';
            let expert = '';
            let organization = '';
            let dateCreate: any = '';

            if (check.nomers) {
                nomer = check.dks[i].nomer || '';
            } else {
                vin = check.dks[i].dk.data.vin || '';
                nomer = check.dks[i].dk.nomer || '';
                regNumber = check.dks[i].dk.data.registrationNumber || '';
                bodyNumber = check.dks[i].dk.data.bodyNumber || '';
                frameNumber = check.dks[i].dk.data.frameNumber || '';
                expert = check.dks[i].dk.expert.login || '';
                organization = check.dks[i].dk.expert.oto.name || '';
                dateCreate = check.dks[i].dk.dateCreate || '';
            }


            if (check.dks[i].status === 'OK') isset = 'Есть';
            if (check.dks[i].status === 'MISS') isset = 'отсутствует';
            if (check.dks[i].status === 'ERR') isset = 'Не удалось проверить';
            if (check.dks[i].status === 'NOCHECK') isset = 'Не проверена';

            ws.cell(i+n, 1).string(String(i + 1)).style(style);
            ws.cell(i+n, 2).string(nomer).style(style);

            if (check.dks[i].status === 'OK') {
                ws.cell(i+n, 3).string(isset).style(style).style({ font: { color: '#009933', bold: true } });
            } else if (check.dks[i].status === 'MISS') {
                ws.cell(i+n, 3).string(isset).style(style).style({ font: { color: '#990000', bold: true } });
            } else {
                ws.cell(i+n, 3).string(isset).style(style);
            }

            ws.cell(i+n, 4).string(expert).style(style);
            ws.cell(i+n, 5).string(organization).style(style);
            ws.cell(i+n, 6).string(vin).style(style);
            ws.cell(i+n, 7).string(regNumber).style(style);
            ws.cell(i+n, 8).string(bodyNumber).style(style);
            ws.cell(i+n, 9).string(frameNumber).style(style);
            ws.cell(i+n, 10).string(dateCreate ? moment(dateCreate).format('DD-MM-YYYY HH:mm:ss') : '').style(style);
        }

        const MAIN_DIR = path.resolve(__dirname, '../../../../files/xls/');
        let file = MAIN_DIR + '/check_result.xlsx';

        await writeFile();
        function writeFile () {
            return new Promise((resolve, reject) => {         
                wb.write(file, (err, stats) => {
                    resolve();
                });
            });
        }

        return file;
    }

    //----------------------------------------------------

    /**
     * Функция возвращает последний номер счета
     */
    private static async getCheckId (): Promise<number> {
        try {
            var last: CheckModel[] = await Check.find().limit(1).sort({$natural:-1});
        } catch (error) {
            throw error;
        }

        return last.length === 0 ? 1 : last[0].chkId + 1;
    }

}