import { Schema, Model, model, SchemaTypes } from "mongoose";
import config from "../../config";
import { RestoreModel } from "../models/restore.model";

const RestoreSchema: Schema = new Schema({
    restoreId: {
        type: Number
    },
    dateCreate: {
        type: Date,
        default: Date.now
    },
    startRestore: {
        type: Date,
    },
    endRestore: {
        type: Date,
    },
    experts: [{
        type: SchemaTypes.ObjectId,
        ref: 'Expert'
    }],
    status: {
        type: String,
        default: 'CREATED'
    },
    dks: [{
        nomer: {
            type: String
        },
        status: {
            type: String,
            default: 'NORESTORE'
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

export const Restore: Model<RestoreModel> = model<RestoreModel>('Restore', RestoreSchema);