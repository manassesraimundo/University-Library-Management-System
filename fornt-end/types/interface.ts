import { Etiqueta, Role, StatusLivro, TipoMembro } from "./enums";

export interface IUsuario {
    id: number;
    nome: string;
    email: string;
    ativo: boolean;
    role: Role;
    criadoEm: Date;
    membro?: IMembro
}

export interface IMembro {
    id: number;
    matricula: string;
    tipo: TipoMembro
    ativo: boolean;
    criadoEm: Date;
    usuarioId?: number;
    usuario?: IUsuario;
    emprestimos: IEmprestimo[];
    reservas: IReserva[];
    historico: IHistoricoLeitura[];
    chatMensagem: IChatMensagem[];
    notificacoes: INotificacao[];
}

export interface IAutor {
    id: number;
    nome: string;
    livros: ILivro[];
}

export interface ICategoria extends IAutor { }

export interface ILivro {
    id: number;
    titulo: string;
    isbn?: string;
    editora?: string;
    status: StatusLivro;
    etiqueta: Etiqueta;
    quantidade: number;
    criadoEm: Date
    autorId: number;
    categoriaId: number;
    autor: IAutor;
    categoria: ICategoria;
    _count?: { reservas: number, emprestimos: number, exemplares: number };
    exemplares: IExemplar[];
    disponiveis: number;
    emprestimos: IEmprestimo[];
    reservas: IReserva[];
    historico: IHistoricoLeitura[]
}

export interface IExemplar {
    id: number;
    codigoBarras: string
    status: StatusLivro;
    observacoes?: string;
    livroId: number;
    livro: ILivro;
    emprestimos: IEmprestimo[]
    historicoLeitura: IHistoricoLeitura[]
}

export interface IEmprestimo {
    tituloPrint: string;
    id: number;
    dataEmprestimo: Date;
    dataPrevista: Date;
    dataDevolucao?: Date;
    renovacoes: number;
    quantidadeEmprestimo: number;
    membroId: number;
    livroId: number;
    membro?: IMembro;
    livro: ILivro;
    multa?: IMulta;
    exemplar: IExemplar
    quantidadeDisponivel: number;
}

export interface IReserva {
    id: number;
    ativa: boolean;
    posicao: number;
    paraData?: Date;
    criadaEm: Date;
    quantidadeReserva: number;
    membroId: number;
    livroId: number;
    membro?: { usuario: IUsuario, matricula: string };
    livro: ILivro
}

export interface IMulta {
    id: number;
    valor: number;
    paga: boolean;
    dataPagamento?: Date;
    emprestimoId: number;
    emprestimo: IEmprestimo;
}

export interface IHistoricoLeitura {
    id: number;
    data: Date;
    membroId: number;
    livroId: number;
    membro?: IMembro;
    livro: ILivro;
}

export interface IChatMensagem {
    id: number;
    content: string;
    role: string;
    criadoEm: Date;
    membroId: number;
    membro?: IMembro;
}

export interface INotificacao {
    id: number;
    mensagem: string;
    lida: boolean;
    criadaEm: Date;
    membroId: number;
    membro?: IMembro;
}

export interface IEmp {
    id:number;
    livroId: number;
    titulo: string;
    categoria: string;
    etiqueta: Etiqueta;
    quantidadeExemplares: number;
    quantidadeDisponiveis: number;
    quantidadeReservado: number;
}