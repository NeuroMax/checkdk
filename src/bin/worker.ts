import config from '../config';
import { App } from '../app';
import { Logger } from "../logger";
let logger = new Logger();

import * as express from 'express';
import * as http from 'http';
import db from "./db";
import { WebSocketService } from '../app/services/web-socket.service';
import { Injector } from '../app/utils/injector';

class Worker {
    private app: express.Application;
    private httpPort: number;
    private httpServer: http.Server;
    private ws: WebSocketService;

    constructor () {
        this.app = App.bootstrap.app;
        this.httpPort = this.normalizePort(config.app.port || 3000);
        this.ws = Injector.get(WebSocketService);
    }

    serve (worker: number) {

        db.init().then(() => {
            this.app.set('port', this.httpPort);
            
            this.httpServer = http.createServer(this.app);
            this.httpServer.listen(this.httpPort, () => {
                this.onListening(this.httpServer, worker);
            });
            this.ws.init(this.httpServer);
            this.httpServer.on('error', this.onError);
        });
    }

    normalizePort(val: any) {
        var port = parseInt(val, 10);

        if (isNaN(port)) {

            return val;
        }

        if (port >= 0) {

            return port;
        }

        return false;
    }

    onError(error: any) {
        if (error.syscall !== "listen") {
            throw error;
        }

        var bind = typeof this.httpPort === "string"
            ? "Pipe " + this.httpPort
            : "Port " + this.httpPort;

        switch (error.code) {
            case "EACCES":
                logger.error(bind + " requires elevated privileges");
                process.exit(1);
                break;
            case "EADDRINUSE":
                logger.error(bind + " is already in use");
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    onListening(server: http.Server, worker: number) {
        var addr = this.httpServer.address();
        var bind = typeof addr === "string"
            ? "pipe " + addr
            : "port " + addr.port;
        console.log("Worker " + worker + " Listening on: " + bind);
    }
}

const worker = new Worker();
export default worker;