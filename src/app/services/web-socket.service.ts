import { Server } from "ws";
import { Inject } from "../utils/injector";
import * as http from "http";
import * as ws from 'ws';
import { Observable, Subject } from 'rxjs';

@Inject
export class WebSocketService {
    private instance: WebSocketService;
    private peers: Array<ws> = [];
    public str: string;

    subject = new Subject(); 

    constructor () {
        this.str = new Date().getMilliseconds().toString();
        console.log('WSS Constructor', this.str);
    }

    public init (server: http.Server) {
        const wss = new ws.Server({ server });
        this.listen(wss);
    }

    private listen (wss: Server) {
        wss.on('connection', (ws, req) => {
            let id = new Date().getMilliseconds().toString();
            console.log('Web Socket Server on connect:', id);

            this.peers.push(ws);

            console.log('Peer push', this.peers.length, this.str);

            ws.on('message', message => {
                // console.log('received: %s', message);

                this.subject.next(message);
            });
            
            ws.on('close', () => {
                for (let i = 0; i < this.peers.length; i++) {
                    if (this.peers[i].readyState === 3) {
                        this.peers.splice(i, 1);
                    }
                }
            });

            // ws.send('Web Socket Ready');
        });
    }

    onMessage (): Subject<any> {
        return this.subject;
    }

    public broadcast (message: any) {
        if (typeof message === 'object') {
            message = JSON.stringify(message);
        };

        this.peers.forEach(ws => {
            ws.send(message);
        });
    }
}