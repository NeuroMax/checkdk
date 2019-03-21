import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cluster from 'cluster';
import * as helmet from "helmet";
import * as cors from 'cors';

import routes from "./routes";
import config from '../config';

//Middlewares
import errorHandler from "./middlewares/errorHandler.middleware";
import responseTime from "./middlewares/responseTime.middleware";
import logReq from "./middlewares/logReq.middleware";

import { CorsOptions } from 'cors';
import { Logger } from '../logger';
import { Server } from 'ws';
import { Injector } from './utils/injector';
import { Sheduler } from './components/check/sheduler';
const logger = new Logger();

export class App {
  public app: express.Application;

  /**
   * App bootstrap
   */
  public static get bootstrap (): App {
    return new App();
  }

  constructor () {
    this.app = express();

    this.configuration();
    this.routes();
    Injector.get(Sheduler);
  }

  //cors options
  private corsOptions (): CorsOptions {
    let options: CorsOptions = {
      origin: '*',
      allowedHeaders: ['Content-Type', 'Content-Disposition', 'Authorization', 'Application'],
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTION'],
      credentials: true
    } 

    return options;
  }

  /**
   * Configure application
   */
  private configuration () {
    global.Promise = require('bluebird').Promise;
  
    this.app.use(cors(this.corsOptions()));
    this.app.use(helmet());
    
    //use json form parser
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));
    
    //use cookie parser
    this.app.use(cookieParser(config.app.secrets.cookie));

  }

  private routes () {
    //Logs
    // this.app.use('*', logReq);
    // this.app.use(responseTime);

    //add static paths
    // this.app.use('/public', express.static(path.resolve(__dirname, '../../public')));
    this.app.use('/stamps', express.static(path.resolve(__dirname, '../../files/stamps')));
    this.app.use('/pdf', express.static(path.resolve(__dirname, './components/pdf/html/result')));
    this.app.use(routes);

    //Error handler
    this.app.use(errorHandler);
  }
}