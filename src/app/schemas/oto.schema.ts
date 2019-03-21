import { Schema, Model, model, SchemaTypes } from "mongoose";
import { OtoModel } from "../models/oto.model";

const OtoSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Отсутствует поле name'],
        unique: true
    },
    name_list: {
        type: String
    },
    login: {
        type: String,
        required: [true, 'Отсутствует поле login'],
        unique: true
    },
    password: {
        type: String
    },
    address: {
        type: String,
        required: [true, 'Отсутствует поле address']
    },
    fact_address: {
        type: String
    },
    inn: {
        type: String
    },
    kpp: {
        type: String
    },
    bank: {
        type: String
    },
    bik: {
        type: String
    },
    checking_account: {
        type: String
    },
    kor_account: {
        type: String
    },
    oto_number: {
        type: String,
        required: [true, 'Отсутствует поле oto_number']
    },
    show_in_list: {
        type: Boolean,
        default: false
    },
    categories: [{
        type: String,
        required: true
    }],
    clients: [{
        type: SchemaTypes.ObjectId,
        ref: 'Client',
        default: []
    }],
    stamp: {
        type: SchemaTypes.ObjectId,
        ref: 'Stamp'
    }
});

export const Oto: Model<OtoModel> = model<OtoModel>('Oto', OtoSchema);