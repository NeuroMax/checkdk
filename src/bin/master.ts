import * as cluster from "cluster";
import * as OS from "os";
import { Logger } from "../logger";
let logger = new Logger();

class Master {

    private CPUCount: number;

    constructor () {
        this.CPUCount = OS.cpus().length;
    }

    public fork () {
        cluster.on('online', worker => {
            console.log(`Worker ${worker.id} running`);
        });

        cluster.on('disconnect', (worker, code, signal) => {
            console.error(`Worker ${worker.id} died`);
            cluster.fork();
        });

        cluster.fork();
    }

}

const master = new Master();

export default master;