import { IRoute } from "../../interfaces/route.interface";
import { Router } from "express";

import access from "../../middlewares/access.middleware";

class RestoreRoute implements IRoute {

    constructor (
        private router: Router = Router()
    ) {}

    public routes() {

        return this.router;
    }
}

const routes = new RestoreRoute();
export default routes.routes();