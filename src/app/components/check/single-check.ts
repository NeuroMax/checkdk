import { Drum } from "./drum";
import { EaistoApi } from "../api/eaisto.api";

export class SingleCheck {

    private drum: Drum;

    constructor (
        private nomer: string,
        private vin: string,
        private regNumber: string,
        private frameNumber: string,
        private bodyNumber: string
    ) {
        this.drum = new Drum();
    }

    async startCheck () {
        try {
            await this.drum.init();
            var expert = await this.drum.getExpert();
            var proxy = await this.drum.getIp();
        } catch (error) {
            throw error;
        }
        
        let api = new EaistoApi(expert, proxy);

        try {
            var response: any = await api.GetCardByVin(
                this.vin || '',
                this. regNumber || '',
                this.bodyNumber || '',
                this.frameNumber || '',
                this.nomer || ''
            );
        } catch (error) {
            error = this.errorHandler(error);
            throw error;
        }

        let error;

        if (response.fault) error = { 
            message: response.fault.faultstring, 
            code: response.fault.faultcode 
        };

        if (error) throw error;

        let result;

        if (response.getCardByVinResponse) {
            result = response.getCardByVinResponse.getCardByVinResult;
        }

        api = undefined;

        return result;
    }

    private errorHandler (error: { status: number; message: string }) {

        let errorsCrashEaisto = [
            'Non-whitespace before first tag.\nLine: 1\nColumn: 1\nChar: F'
        ];

        if (errorsCrashEaisto.indexOf(error.message) + 1) {
            error.message = 'Ошибка ЕАИСТО! Повторите запрос позже!'
        }

        return error;
    }

}