import GrupoUsuario from "./grupoUsuario";

export default class User {
    id?: number;
    login?: string
    firstName?: string;
    email?: string;
    activated?: boolean
    password?: string;
    grupoUsuario?: GrupoUsuario;
}