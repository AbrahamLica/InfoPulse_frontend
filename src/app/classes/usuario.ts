import GrupoUsuario from "./grupoUsuario";

export default class Usuario {
    id?: number;
    perfil?: "ADMINISTRADOR" | "ATENDENTE"
    ficha: any
    nome?: string;
    login?: string;
    senha?: string;
    grupoUsuario?: GrupoUsuario;
    status?: String;
}