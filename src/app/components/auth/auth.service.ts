import config from "../../../config";
import * as jwt from "jsonwebtoken";
import { UserModel } from "../../models/user.model";
import { User } from "../../schemas/user.schema";
import { ClientModel } from "../../models/client.model";


export class AuthService {

    /**
     * Авторизация
     * @param email Email
     * @param password пароль
     */
    public static async signIn (login: string, password: string, current_client: ClientModel): Promise<{ token }> {
        if (!login || !password) throw({ message: 'Отсутствуют данные' });

        try {
            var user: UserModel = await User.findOne({ $or: [{ login }, { email: login }] }).populate('app_client', { key: false });
        } catch (error) {
            throw error;
        }

        try {
            var sign = await user.comparePassword(password);
        } catch (error) {
            throw error;
        }

        if (!sign) throw { message: "email или пароль введены не верно" };

        if (!AuthService.checkUserAppClient(current_client, user)) throw { status: 403, message: 'У вас нет доступа к данному приложению (клиенту)!' };
        if (!AuthService.checkUserEnabled(user)) throw { status: 401, message: 'Вы отключены! Обратитесь в техподдержку.' };
        
        let expired = +new Date() + 24 * 60 * 60 * 1000;

        const token: string = await jwt.sign({ _id: user._id, expired }, config.app.secrets.token);

        return { token };
    }

    /**
     * Проверка доступа по ролям
     * @param access_roles Роли для разрешения доступа
     * @param user Проверяемый пользователь
     */
    public static checkAccess (access_roles: string[], user: UserModel) {
        const h_role = config.role_hierarchy;
        const u_role = user.roles;

        for (let role of access_roles) {
            if (u_role.indexOf(role) + 1) return true;
        }

        //Generate stack roles
        let stack_roles = [];
        const keys = Object.keys(h_role);

        for (let key of keys) {
            stack_roles[key] = null;
        }

        for (let key of keys) {
            let r = h_role[key];

            for (let s_r of r) {
                stack_roles[s_r] = key;
            }
        }

        // if SUPER_ADMIN

        for (let role of u_role) {
            if (stack_roles[role] === null) return true;
        }

        //Check of hierarchy
        let check = false;

        for (let role of access_roles) {
            for (let r of u_role) {
                checkParent(role, r)
            }
        }

        function checkParent (role: string, base: string) {
            if (stack_roles[role]) {
                if (stack_roles[role] === base) check = true;
                else checkParent(stack_roles[role], base);
            }
            else return false;
        }

        if (check) return true;

        return false;
    }

    /**
     * Проверка доступа клиента к приложению (клиенту)
     * @param current_client приложение клиент
     * @param user пользователь
     */
    public static checkUserAppClient (current_client: ClientModel, user: UserModel): Boolean {
        const user_client = user.app_client;

        if (AuthService.checkAccess(['ROLE_ADMIN'], user)) return true;
        if (current_client.control_center && AuthService.checkAccess(['ROLE_PROVIDER'], user)) return true;

        let chk = false;

        for (let client of user_client) {
            let a = String(client);
            let b = String(current_client._id);

            if (a === b) chk = true;
        }

        return chk;
    }

    /**
     * Проверяет включен ли пользователь 
     * @param user пользователь
     */
    public static checkUserEnabled (user: UserModel): Boolean {
        if (!user.enabled) return false;

        return true;
    }

    /**
     * Получение иерархии ролей
     */
    public static async getRolesHierarchy (): Promise<any> {
        return config.role_hierarchy;
    }

}