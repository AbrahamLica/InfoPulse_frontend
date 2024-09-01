import GrupoUsuario from "./grupoUsuario";
import Permissao from "./permissao";

export default class VinculoGrupoUsuario{
    id?: number;
    grupoUsuario?: GrupoUsuario;
    permissao?: Permissao;
    habilitado?: boolean;
}