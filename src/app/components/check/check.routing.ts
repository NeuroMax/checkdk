import { IRoute } from "../../interfaces/route.interface";
import { Router } from "express";

import access from "../../middlewares/access.middleware";
import { CheckController } from "./check.controller";

class CheckRoute implements IRoute {

    constructor (
        private router: Router = Router()
    ) {}

    public routes() {

        this.router.get('/', access('ROLE_PROVIDER'), CheckController.getAll);
        this.router.get('/:id', access('ROLE_PROVIDER'), CheckController.getById);
        this.router.get('/xls/:id', access('ROLE_PROVIDER'), CheckController.getXls);
        
        this.router.post('/', access('ROLE_PROVIDER'), CheckController.create);
        this.router.post('/single', CheckController.singleCheck);
        this.router.delete('/:id', access('ROLE_PROVIDER'), CheckController.remove);

        return this.router;
    }
}

const routes = new CheckRoute();
export default routes.routes();