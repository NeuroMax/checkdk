import { Schema, SchemaTypes, Model, model } from "mongoose";
import { DkModel } from "../models/dk.model";

const DkSchema: Schema = new Schema({
    who_created: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    client: {
        type: SchemaTypes.ObjectId,
        ref: 'Client',
        required: true
    },
    registerCardResult: {
        type: Number
    },
    nomer: {
        type: String,
        unique: true
    },
    offlineNomer: {
        type: String
    },
    dateOfRetest: {
        type: Date
    },
    isArchive: {
        type: Number,
        default: 0
    },
    status: {
        type: Boolean,
        default: false
    },
    dateCreate: {
        type: Date,
        default: Date.now
    },
    dateReceiving: {
        type: Date
    },
    selling_price: {
        type: Number,
        default: 0
    },
    draft: {
        type: Boolean,
        default: false
    },
    expert: {
        type: SchemaTypes.ObjectId,
        ref: 'Expert'
    },
    data: {
        bodyNumber: {
            type: String
        },
        dateOfDiagnosis: {
            type: Date
        },
        form: {
            comment: {
                type: String
            },
            duplicate: {
                type: Boolean,
                default: false
            },
            /*
            series: {
                type: String
            },
            number: {
                type: String,
                required: true
            },*/
            validity: {
                type: Date
            }
        },
        name: {
            type: String
        },
        fName: {
            type: String
        },
        mName: {
            type: String
        },
        note: {
            type: String
        },
        registrationNumber: {
            type: String,
            uppercase: true
        },
        testResult: {
            type: String
        },
        testType: {
            type: String
        },
        values: [{
            code: {
                type: Number
            },
            testResult: {
                type: Number
            }
        }],
        vehicle: {
            make: {
                type: String
            },
            model: {
                type: String
            }
        },
        vehicleCategory: {
            type: String
        },
        vehicleCategory2: {
            type: String
        },
        vin: {
            type: String
        },
        year: {
            type: Number
        },
        frameNumber: {
            type: String
        },
        emptyMass: {
            type: Number
        },
        maxMass: {
            type: Number
        },
        fuel: {
            type: String
        },
        brakingSystem: {
            type: String
        },
        tyres: {
            type: String
        },
        killometrage: {
            type: Number
        },
        registrationDocument: {
            documentType: {
                type: String
            },
            series: {
                type: String
            },
            number: {
                type: String
            },
            organization: {
                type: String
            },
            date: {
                type: Date
            },
            foreign: {
                type: String
            }
        },
        dateOfRetest: {
            type: Date
        },
        expert: {
            name: {
                type: String
            },
            fName: {
                type: String
            },
            mName: {
                type: String
            }
        },
        operator: {
            fullName: {
                type: String
            },
            shortName: {
                type: String
            }
        }
    },
    lastAction: {
        type: SchemaTypes.ObjectId,
        ref: 'LogActivity'
    },
    pdf: {
        type: String
    },
    test: {
        status: {
            type: Boolean,
            default: false
        },
        use: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date
        },
        response: {
            type: Object
        }
    },
    header: {
        code: String,
        name: String,
        address: String
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

export const Dk: Model<DkModel> = model<DkModel>('Dk', DkSchema);