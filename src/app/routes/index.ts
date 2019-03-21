import * as express from 'express';

//Middlewares
import checkUserToken from "../middlewares/checkUserToken.middleware";
import checkAppClientKey from "../middlewares/checkAppClientKey.middleware";
import checkUserAppClient from "../middlewares/checkUserAppClient.middleware";

import checkRoutes from "../components/check/check.routing";

export class Routes {
  
  constructor (
    private app: express.Application = express()
  ) {}
  
  init (): express.Application {
    
    this.app.use('*', checkAppClientKey); //Проверка ключа приложения    
    this.app.use('*', checkUserToken); //Проверка токена пользователя
    this.app.use('*', checkUserAppClient); //Проверка привязки пользователя к приложению

    this.app.use('/check', checkRoutes);

    return this.app;
  }
}

const routes = new Routes();
export default routes.init();