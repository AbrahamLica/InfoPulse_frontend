import GrupoUsuario from "./grupoUsuario";

export default class Usuario {
    id?: number;
    login?: string
    firstName?: string;
    lastName?: string;
    email?: string;
    imageUrl?: string
    ativo?: boolean
    grupoUsuario?: GrupoUsuario;
}