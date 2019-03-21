import { Schema, Model, model } from "mongoose";
import { IpModel } from "../models/ip.model";

const IpSchema: Schema = new Schema({
    ip: {
        type: String,
        required: true,
        unique: true
    },
    port: {
        type: Number
    },
    login: {
        type: String,
    },
    password: {
        type: String
    },
    provider: {
        type: String
    },
    enabled: {
        type: Boolean,
        default: true
    },
    description: {
        type: String
    },
    lastUse: {
        type: Date
    }
});

export const Ip: Model<IpModel> = model<IpModel>('Ip', IpSchema);