import { Schema, model, Model, SchemaTypes } from "mongoose";
import * as bcrypt from "bcryptjs";
import { UserModel } from "../models/user.model";

const UserSchema: Schema = new Schema({
    old_id: {
        type: Number
    },
    login: {
        type: String,
        required: [true, 'Отсутствует поле login'],
        unique: [true, 'Логин занят']
    },
    f_name: {
        type: String,
        required: [true, 'Отсутствует поле f_name']
    },
    name: { 
        type: String, 
        required: [true, 'Отсутствует поле name'] 
    },
    phone: { 
        type: String,
        lowercase: true
    },
    email: { 
        type: String, 
        required: [true, 'Отсутствует поле email'], 
        unique: true, 
        lowercase: true
    },
    skype: {
        type: String,
        lowercase: true
    },
    password: { 
        type: String, 
        required: [true, 'Отсутствует поле password']
    },
    roles: [{
        type: String,
        required: [true, 'Не задана роль']
    }],
    app_client: [{
        type: SchemaTypes.ObjectId,
        ref: 'Client',
        required: [true, 'Не указано приложение Клиент']
    }],
    owner: {
        type: SchemaTypes.ObjectId,
        ref: 'User'
    },
    date_create: {
        type: Date,
        default: Date.now
    },
    last_visit: {
        type: Date
    },
    price_dk: {
        type: Number
    },
    payment_period: {
        type: Number,
        default: 0
    },
    debt_limit: {
        type: Number
    },
    opAddress: {
        type: String
    },
    address: {
        type: String
    },
    stamp: {
        type: SchemaTypes.ObjectId,
        ref: 'Stamp'
    },
    enabled: {
        type: Boolean,
        default: true
    },
    locked: {
        type: Boolean,
        default: false
    },
    note: {
        type: String
    },
    avatar: {
        type: String
    },
    _deleted: {
        type: Boolean,
        default: false
    },
    settings: {
        operators: [{
            type: SchemaTypes.ObjectId,
            ref: 'Oto',
            default: []
        }]
    }
});

/**
 * При создании кодирует пароль
 */
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hashSync(this.password, salt);
    this.password = hash;

    next();
});

/**
 * При изменении если присутствует пароль кодирует его
 */
UserSchema.pre('update', async function (next) {

    let password;

    if (this.getUpdate().$set) {
        password = this.getUpdate().$set.password;
    }
    
    if (password) {
        const salt = await bcrypt.genSaltSync(10);
        const hash = await bcrypt.hashSync(password, salt);
        password = hash;
        this.update({}, { password });
    } else this.update();
    
    next();
});

/**
 * Сверяет пароль
 */
UserSchema.methods.comparePassword = function (password: any): Boolean {
    return bcrypt.compareSync(password, this.password);
};

export const User: Model<UserModel> = model<UserModel>('User', UserSchema);