import { Schema, Model, model, SchemaTypes } from "mongoose";
import config from "../../config";
import { CheckModel } from "../models/check.model";

const CheckSchema: Schema = new Schema({
    chkId: {
        type: Number
    },
    dateCreate: {
        type: Date,
        default: Date.now
    },
    start: {
        type: Date
    },
    end: {
        type: Date
    },
    startCheck: {
        type: Date,
    },
    endCheck: {
        type: Date,
    },
    expert: [{
        type: SchemaTypes.ObjectId,
        ref: 'Expert'
    }],
    client: [{
        type: SchemaTypes.ObjectId,
        ref: 'Client'
    }],
    nomers: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: 'CREATED' // CREATED , STARTED , FINISHED
    },
    dks: [{
        nomer: {
            type: String
        },
        status: {
            type: String,
            default: 'NOCHECK' // NOCHECK - не проверялась , MISS - отсутствует в еаисто , OK - есть в еаисто
        },
        dk: {
            type: SchemaTypes.ObjectId,
            ref: 'Dk'
        }
    }],
    console: {
        date: Date,
        message: String
    }
});

export const Check: Model<CheckModel> = model<CheckModel>('Check', CheckSchema);