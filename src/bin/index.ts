import * as cluster from "cluster";
import master from "./master";
import worker from "./worker";

class Server {

    start () {
        if (cluster.isMaster) {
            master.fork();
        } else {
            worker.serve(cluster.worker.id);
        }
    }

}

const server = new Server();
server.start();