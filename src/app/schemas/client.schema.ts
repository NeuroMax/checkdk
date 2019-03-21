import { Schema, Model, model } from "mongoose";
import { ClientModel } from "../models/client.model";
import * as jwt from "jsonwebtoken";
import config from "../../config";

const ClientSchema: Schema = new Schema({
    title: {
        type: String,
        unique: [true, 'Клиент с таким названием уже существует!'],
        required: [true, 'Нет переменной title'],
        lowercase: true
    },
    description: {
        type: String
    },
    url: {
        type: String,
        unique: [true, 'Клиент с таким адресом уже существует!'],
        required: [true, 'Нет переменной url'],
        lowercase: true
    },
    enabled: {
        type: Boolean,
        default: true
    },
    key: {
        type: String
    },
    date_create: {
        type: Date,
        default: Date.now
    },
    last_activity: {
        type: Date
    },
    control_center: {
        type: Boolean,
        default: false
    },
    old_url: {
        type: String
    },
    background: {
        type: String
    }
});

ClientSchema.pre('save', async function (next) {

    const key: string = await jwt.sign({ _id: this._id }, config.app.secrets.app_key);
    this.key = key;

    next();
});

export const Client: Model<ClientModel> = model<ClientModel>('Client', ClientSchema);