import { ExpertModel } from "../models/expert.model";
import { DkModel } from "../models/dk.model";

export interface IRestore {
    restoreId: number,
    dateCreate: Date,
    startRestore: Date,
    endRestore: Date,
    experts: ExpertModel[],

    // CREATED , STARTED , FINISHED
    status: string,
    dks: {
        nomer: string,

        // NORESTORE - не восстанавливалась, OVERDUE - карта просрочена, ERR - не получилось восстановить, OK - восстановлена
        status: string,
        dk: DkModel
    }[],
    console: {
        date: Date,
        message: string
    }[]
}