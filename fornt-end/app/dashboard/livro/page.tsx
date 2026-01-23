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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LivrosPage() {
  const router = useRouter()
  const [livros, setLivros] = useState([])
  const [categorias, setCategorias] = useState([])
  const [titulo, setTitulo] = useState("")
  const [status, setStatus] = useState("DISPONIVEL")
  const [categoriaInput, setCategoriaInput] = useState('null')
  const [page, setPage] = useState(1)

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
      const response = await api.get(`/livros?titulo=${titulo}`, {
        params: {
          status: status,
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
    getCategoria()
    fetchLivros()
  }, [status, page, titulo])

  useEffect(() => {
    if (categoriaInput !== 'null')
      fetchLivrosPorCategoria()
    else {
      getCategoria()
      fetchLivros()
    }
  }, [categoriaInput])

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
              categorias.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>
              ))
            }
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DISPONIVEL">Disponíveis</SelectItem>
            <SelectItem value="EMPRESTADO">Emprestados</SelectItem>
            <SelectItem value="RESERVADO">Reservados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABELA */}
      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {livros.length > 0 ? livros.map((livro: any) => (
              <TableRow key={livro.id}>
                <TableCell className="font-medium">{livro.titulo}</TableCell>
                <TableCell>{livro.categoria?.nome}</TableCell>
                <TableCell>
                  <Badge variant={livro.status === 'DISPONIVEL' ? 'success' : livro.status === 'RESERVADO' ? 'default' : 'destructive'}>
                    {livro.status}
                  </Badge>
                </TableCell>
                <TableCell>{livro.quantidade}</TableCell>
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
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  Nenhum livro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
