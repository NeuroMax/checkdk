import { IRoute } from "../../interfaces/route.interface";
import { Router } from "express";
import { AuthController } from "./auth.controller";

class AuthRoute implements IRoute {

    constructor (
        private router: Router = Router()
    ) {}

    routes () {

        this.router.post('/signIn', AuthController.signIn);
        this.router.get('/roles', AuthController.getRolesHierarchy);
        this.router.get('/client-name', AuthController.getNameClient);

        return this.router;
    }

}

const routes = new AuthRoute();
export default routes.routes();