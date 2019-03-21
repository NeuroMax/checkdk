import { ExpertModel } from "../../models/expert.model";
import { DkModel } from "../../models/dk.model";
import { Expert } from "../../schemas/expert.schema";
import { Dk } from "../../schemas/dk.schema";
import { RestoreModel } from "../../models/restore.model";
import { Restore } from "../../schemas/restore.schema";

export class RestoreService {
    
    static async create (experts: string[], nomers: string[]) {
        if (!nomers || !nomers.length) throw { message: 'Не указаны номера карт' };

        let expertArr: ExpertModel[];
        let dks: DkModel[];
        
        if (experts) {
            try {
                expertArr = await Expert.find({
                    _id: { $in: experts },
                    enabled: true
                });
            } catch (error) {
                throw error;
            }

            if (!expertArr || !expertArr.length) throw { message: 'Нет экспертов: Возможно выбранные эксперты отключены!' };
        }

        try {
            dks = await Dk.find({
                nomer: { $in: nomers },
                deleted: false
            });
        } catch (error) {
            throw error;
        }

        let dkArr = [];

        for (let dk of dks) {
            dkArr.push({
                nomer: dk.nomer,
                dk
            });
        }

        let restoreData = {
            restoreId: await RestoreService.getRestoreId(),
            experts: expertArr,
            dks: dkArr
        };

        try {
            var restore: RestoreModel = await Restore.create(restoreData);
        } catch (error) {
            throw error;
        }

        return restore;
    }
    
    static async remove (_id: string) {
        try {
            await Restore.remove({ _id });
        } catch (error) {
            throw error;
        }

        return;
    }
    
    static async getAll (skip: number, limit: number) {
        try {
            var restores: RestoreModel[] = await Restore.find()
            .populate('experts');
        } catch (error) {
            throw error;
        }

        let result = {
            data: restores,
            count: restores.length
        }
        
        return result;
    }


    static async getById (id: string) {
        try {
            var restore: RestoreModel = await Restore.findById(id)
                .populate('experts');
        } catch (error) {
            throw error;
        }

        return restore;
    }

    /**
     * Функция возвращает последний номер счета
     */
    private static async getRestoreId (): Promise<number> {
        try {
            var last: RestoreModel[] = await Restore.find().limit(1).sort({$natural:-1});
        } catch (error) {
            throw error;
        }

        return last.length === 0 ? 1 : last[0].restoreId + 1;
    }
}