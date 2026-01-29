'use client'

import { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";
import { ICategoria, IEmprestimo, ILivro } from "@/types/interface";
import { Etiqueta, StatusLivro } from "@/types/enums";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function LivrosPage() {
  const router = useRouter();

  const [livros, setLivros] = useState<ILivro[]>([]);
  const [emprestimos, setEmprestimos] = useState<IEmprestimo[]>([]);
  const [categorias, setCategorias] = useState<ICategoria[]>([]);

  const [status, setStatus] = useState<string>(StatusLivro.DISPONIVEL);
  const [etiqueta, setEtiqueta] = useState<string>(Etiqueta.BRANCO);
  const [titulo, setTitulo] = useState<string>("");
  const [categoriaInput, setCategoriaInput] = useState<string>('null');

  const [page, setPage] = useState<number>(1);

  async function getCategoria() {
    try {
      const response = await api.get('/categoria', {
      });

      setCategorias(response.data);

    } catch (error: any) {
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    }
  }

  async function fetchLivros() {
    try {
      if (titulo) {
        setStatus('');
        setEtiqueta('');
      }

      if (status === StatusLivro.EMPRESTADO) {
        const response = await api.get(`/emprestimos/todos?etiqueta=${etiqueta}`);
        setEmprestimos(response.data);
        return;
      }

      const response = await api.get(`/livros?titulo=${titulo}`, {
        params: {
          status: status,
          etiqueta,
          page: page,
          limit: 20
        }
      });

      setLivros(response.data);

    } catch (error: any) {
      console.error("Erro ao carregar livros:", error);

      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    }
  }

  async function fetchLivrosPorCategoria() {
    try {
      const response = await api.get(`/livros/categoria/${categoriaInput}`, {
        params: {
          page: page,
          limit: 20
        }
      });
      setLivros(response.data);

    } catch (error: any) {
      console.error("Erro ao carregar livros:", error);

      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    }
  }

  useEffect(() => {
    getCategoria();
    fetchLivros();

    if (!titulo) {
      setStatus(status || StatusLivro.DISPONIVEL);
      setEtiqueta(etiqueta || Etiqueta.BRANCO);
    }
  }, [status, page, titulo, etiqueta]);

  useEffect(() => {
    if (categoriaInput !== 'null')
      fetchLivrosPorCategoria();
    else {
      getCategoria();
      fetchLivros();
    }
  }, [categoriaInput]);

  const handleDeletarLivro = async (id: number) => {
    try {
      await api.delete(`/livros/${id}`);

      toast.success("Livro removido com sucesso!");

      fetchLivros();

    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao deletar livro";
      toast.error(message);

      if (error.response?.status === 401) {
        router.replace('/login');
      }
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="text-2xl font-bold">Acervo de Livros</h1>
        </div>

        <CreateLivroModal onLivroCriado={fetchLivros} />
      </div>

      {/* FILTROS */}
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
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">Selecionar categoria...</SelectItem>
            {
              categorias.map((cat: ICategoria) => (
                <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>
              ))
            }
          </SelectContent>
        </Select>

        <Select value={etiqueta} onValueChange={setEtiqueta}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Etiqueta.BRANCO}>BRANCO</SelectItem>
            <SelectItem value={Etiqueta.AMARELO}>AMARELO</SelectItem>
            <SelectItem value={Etiqueta.VERMELHO}>VERMELHO</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
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

      {/* TABELA */}
      <div className="border rounded-md bg-white">
        {status !== StatusLivro.EMPRESTADO ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Etiqueta</TableHead>
                {
                  status === StatusLivro.DISPONIVEL ? <TableHead>Quantidade</TableHead>
                    : <TableHead>Quantidade Reservado</TableHead>
                }
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                livros.length > 0 ? livros.map((livro: ILivro) => (
                  <TableRow key={livro.id}>
                    <TableCell className="font-medium">{livro.titulo}</TableCell>
                    <TableCell>{livro.categoria?.nome}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          livro.status === StatusLivro.DISPONIVEL ? 'success'
                            : livro.status === StatusLivro.RESERVADO ? 'default' : 'destructive'
                        }
                      >
                        {livro.status}
                      </Badge>
                    </TableCell>

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
                    <TableCell>
                      {status === StatusLivro.DISPONIVEL ? livro.quantidade : livro._count?.reservas}
                    </TableCell>
                    <TableCell className="text-right">
                      <ViewLivroModal livroId={livro.id} />

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente o livro
                              <strong> "{livro.titulo}"</strong> e removerá os dados de nossos servidores.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletarLivro(livro.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
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
        ) : (
          <div className="border rounded-md bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Etiqueta</TableHead>
                  <TableHead>Quantidade Emprestado</TableHead>
                  <TableHead>Quantidade Disponivel</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {emprestimos.length > 0 ? emprestimos.map((emp: IEmprestimo) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.livro.titulo}</TableCell>
                    <TableCell className="font-medium">{emp.livro.categoria?.nome}</TableCell>
                    <TableCell className="font-medium">
                      <Badge
                        variant={
                          emp.livro.status === StatusLivro.DISPONIVEL ? 'success'
                            : emp.livro.status === StatusLivro.RESERVADO ? 'default' : 'destructive'
                        }
                      >
                        {emp.livro.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-medium">
                      <Badge variant={emp.livro.etiqueta === Etiqueta.BRANCO ? 'outline' : 'yellow'}>
                        {emp.livro.etiqueta}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{emp.livro._count?.emprestimos}</TableCell>
                    <TableCell className="font-medium">{emp.livro.quantidade}</TableCell>

                    <TableCell className="text-right">
                      <ViewLivroModal livroId={emp.livro.id} />

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente o livro
                              <strong> "{emp.livro.titulo}"</strong> e removerá os dados de nossos servidores.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletarLivro(emp.livro.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
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
        )}
      </div>
    </div>
  )
}
