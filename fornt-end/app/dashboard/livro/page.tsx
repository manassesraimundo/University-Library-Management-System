'use client'

import { useState, useEffect, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search, Filter, Trash2 } from "lucide-react";
import { CreateLivroModal } from "@/components/create-livro-modal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ViewLivroModal } from "@/components/view-livro-modal";
import { ICategoria, IEmp } from "@/types/interface";
import { Etiqueta, StatusLivro } from "@/types/enums";
import { toast } from "sonner";
import { api } from "@/lib/api";
import AlertGlobal from "@/components/alertGlobal";

export default function LivrosPage() {
  const [livros, setLivros] = useState<IEmp[]>([]);
  const [categorias, setCategorias] = useState<ICategoria[]>([]);

  const [status, setStatus] = useState<string>(StatusLivro.DISPONIVEL);
  const [etiqueta, setEtiqueta] = useState<string>(Etiqueta.BRANCO);
  const [titulo, setTitulo] = useState<string>("");
  const [categoriaInput, setCategoriaInput] = useState<string>('null');
  const [page, setPage] = useState<number>(1);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      let response;

      if (categoriaInput !== 'null') {
        response = await api.get(`/livros/categoria/${categoriaInput}`, {
          params: { page, limit: 20, etiqueta }
        });
      }
      else if (status === StatusLivro.EMPRESTADO) {
        response = await api.get(`/emprestimos/todos`, {
          params: { etiqueta }
        });
      }
      else if (status === StatusLivro.RESERVADO) {
        response = await api.get(`livros/reservas`, {
          params: { etiqueta }
        });
      }
      else {
        response = await api.get(`/livros`, {
          params: {
            titulo: titulo || undefined,
            status: status,
            etiqueta,
            page,
            limit: 20
          }
        });
      }

      setLivros(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) window.location.href = '/login';
      const msg = error.response?.data.message || "Erro ao sincronizar dados com o servidor";
      setMessage(msg);
      setIsOpen(true);
      
    }
  }, [status, etiqueta, titulo, categoriaInput, page]);

  useEffect(() => {
    const getCategorias = async () => {
      try {
        const res = await api.get('/categoria');
        setCategorias(res.data);
      } catch (e) { }
    };
    getCategorias();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeletarLivro = async (id: number) => {
    try {
      await api.delete(`/livros/${id}`);
      toast.success("Livro removido com sucesso!");
      fetchData();
    } catch (error: any) {
      if (error.response?.status === 401) window.location.href = '/login';
      const msg = error.response?.data.message || "Erro ao deletar livro";
      setMessage(msg);
      setIsOpen(true);
    }
  };

  return (
    <div className="p-6 space-y-4">
      {
        isOpen && <AlertGlobal isOpen={isOpen} setIsOpen={() => setIsOpen(false)} message={message} titulo="Erro" />
      }
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="text-2xl font-bold">Acervo de Livros</h1>
        </div>
        <CreateLivroModal onLivroCriado={fetchData} />
      </div>

      {/* FILTROS - Mantendo sua estilização */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título..."
            className="pl-8"
            value={titulo}
            onChange={(t) => setTitulo(t.target.value)}
          />
        </div>

        <Select value={categoriaInput} onValueChange={setCategoriaInput}>
          <SelectTrigger className="w-[180px] cursor-pointer">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">Selecionar categoria...</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={etiqueta} onValueChange={setEtiqueta}>
          <SelectTrigger className="w-[180px] cursor-pointer">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Etiqueta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Etiqueta.BRANCO}>BRANCO</SelectItem>
            <SelectItem value={Etiqueta.AMARELO}>AMARELO</SelectItem>
            <SelectItem value={Etiqueta.VERMELHO}>VERMELHO</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px] cursor-pointer">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={StatusLivro.DISPONIVEL}>DISPONÍVEL</SelectItem>
            <SelectItem value={StatusLivro.EMPRESTADO}>EMPRESTADO</SelectItem>
            <SelectItem value={StatusLivro.RESERVADO}>RESERVADO</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABELA - Simplificada mantendo seu visual */}
      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Etiqueta</TableHead>
              <TableHead>Quantidade de Exemplares</TableHead>
              <TableHead>
                {status === StatusLivro.RESERVADO ? "Qtd. Reservado" : "Disponíveis"}
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {livros.length > 0 ? livros.map((livro, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{livro.titulo}</TableCell>
                <TableCell>{livro.categoria}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      livro.etiqueta === Etiqueta.BRANCO ? 'outline'
                        : livro.etiqueta === Etiqueta.AMARELO ? 'yellow' : 'destructive'
                    }
                  >
                    {livro.etiqueta}
                  </Badge>
                </TableCell>
                <TableCell>{livro.quantidadeExemplares}</TableCell>
                <TableCell>
                  {status === StatusLivro.RESERVADO ? livro.quantidadeReservado : livro.quantidadeDisponiveis}
                </TableCell>
                <TableCell className="text-right">
                  <ViewLivroModal livroId={livro.livroId || livro.id} />

                  <AlertDialog>
                    {/* <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger> */}
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação excluirá o livro <strong>"{livro.titulo}"</strong> permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeletarLivro(livro.livroId || livro.id)}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          Confirmar Exclusão
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhum livro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}