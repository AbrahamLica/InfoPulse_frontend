export default class Noticia {
  id?: number;
  titulo?: string;
  conteudo?: string;
  resumo?: string;
  dataPublicacao?: any;
  dataUltimaModificacao?: Date;
  autor?: string;
  ativo?: boolean;
  imagem?: any;
  imagemContentType?: string | null | undefined;
  categoria?: any;
}
