import config from "../config";
import * as mongoose from "mongoose";
import * as bluebird from "bluebird";
import { Logger } from "../logger";
let logger = new Logger();

class Db {

    init (): Promise<void> {
        let serverDb = config.app.db.local;

        (<any>mongoose).Promise = bluebird;
        return mongoose.connect(serverDb, { useMongoClient: true })
            .then(() => {
                console.info(`Mongo connected: ${serverDb}`);
            })
            .catch(err => {
                console.error(`Mongo connection ERROR: ${err}`);
                process.exit(2);
            });
    }

}

const db = new Db();
export default db;