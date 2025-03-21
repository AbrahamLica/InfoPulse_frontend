import GrupoUsuario from "./grupoUsuario";
import User from "./user";

export default class Usuario {
    id?: number;
    login?: string
    nome?: string;
    email?: string;
    imageUrl?: string;
    password?: string;
    ativo?: boolean
    user?: User;
    grupoUsuario?: GrupoUsuario;
}