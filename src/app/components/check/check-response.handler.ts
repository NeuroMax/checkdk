export class CheckResponseHandler {

    static async handle (response: any) {
        let error;

        console.log(response);

        if (response.fault) error = { 
            message: response.fault.faultstring, 
            code: response.fault.faultcode 
        };

        if (error) throw error;

        let data;

        if (response.getCardByVinResponse) {
            let result = response.getCardByVinResponse.getCardByVinResult;

            if (Array.isArray(result)) result = result[0];

            data = {
                nomer: result.form.number,
                id: result.id
            };

        }
        
        return data;
    }

}