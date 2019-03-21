import { Schema, Model, model, SchemaTypes } from "mongoose";
import { ExpertModel } from "../models/expert.model";

const ExpertSchema: Schema = new Schema({
    login: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    dk_limit: {
        type: Number,
        required: true
    },
    dk_price: {
        type: Number
    },
    priority: {
        type: Number,
        default: 0
    },
    use_in_check: {
        type: Boolean,
        default: false
    },
    owner: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    oto: {
        type: SchemaTypes.ObjectId,
        ref: 'Oto',
        required: true
    },
    categories: [{
        type: String
    }],
    f_name: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    s_name: {
        type: String,
        required: true
    },
    organization: {
        type: String
    },
    address: {
        type: String,
        required: true
    },
    fact_address: {
        type: String
    },
    number: {
        type: Number
    },
    regions: [{
        code: [{ type: Number }],
        title: { type: String }
    }],
    apps: [{
        type: SchemaTypes.ObjectId,
        ref: 'Client',
        required: true
    }],
    apiProvider: {
        type: String,
        default: 'eaisto'
    },
    allowed: [{
        type: String
    }],
    lastUse: {
        type: Date
    },
    enabled: {
        type: Boolean,
        default: true
    }
});

export const Expert: Model<ExpertModel> = model<ExpertModel>('Expert', ExpertSchema);