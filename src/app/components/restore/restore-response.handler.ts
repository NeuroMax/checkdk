export class RestoreResponseHandler {
    
    static async handle (response: any) {
        let err: { code, message };
        
        if (response.fault) {
            err = {
                message: response.fault.faultstring, 
                code: response.fault.faultcode 
            };
        };

        if (err) throw err;

        let result = response.registerCardResponse;

        return result;
    }
}