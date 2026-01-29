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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CreateAutorModal } from "@/components/create-autor-modal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { IAutor } from "@/types/interface";
import { api } from "@/lib/api";

export default function AutoresPage() {
  const router = useRouter()

  const [autores, setAutores] = useState<IAutor[]>([])
  const [busca, setBusca] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const carregarAutores = async () => {
    setLoading(true)
    try {
      const response = await api.get('/autor', {
        params: {
          'nome-autor': busca
        }
      })

      setAutores(response.data)
    } catch (error: any) {
      toast.error("Erro ao carregar autores")

      if (error.response?.status === 401) 
        router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarAutores()
    }, 500)

    return () => clearTimeout(timer)
  }, [busca])

  const handleDeletar = async (id: number) => {

    try {
      const re = await api.delete(`/autor/${id}`)

      if (re.status === 200)
        toast.success("Autor removido com sucesso")

      carregarAutores()
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro ao remover autor"
      toast.error(msg)
    }
  }


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold">Escritores & Autores</h1>
            <p className="text-muted-foreground text-sm">Gerencie os autores cadastrados no acervo.</p>
          </div>
        </div>

        <CreateAutorModal onSucesso={carregarAutores} />
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar autor pelo nome..."
            className="pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]"> </TableHead>
              <TableHead>Nome do Autor</TableHead>
              <TableHead>Números de livros associado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10">
                  <Loader2 className="animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : autores.length > 0 ? (
              autores.map((autor: IAutor, index: number) => (
                <TableRow key={autor.id}>
                  <TableCell className="font-mono text-muted-foreground">#{index + 1}</TableCell>
                  <TableCell className="font-medium">{autor.nome}</TableCell>
                  <TableCell className="font-medium">
                    {autor.livros.length > 0 ? autor.livros.length + ' -  livros associado' : 'Nenhum livro associado'}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-red-50">
                          <Trash2 size={18} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Autor?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {autor.livros.length > 0 ? 'O autor contem livros associado não pode ser deletado' : 'Deletar este autor?'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          {
                            !autor.livros.length && (
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDeletar(autor.id)}
                            >
                              Confirmar
                            </AlertDialogAction>)
                          }
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                  Nenhum autor encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}