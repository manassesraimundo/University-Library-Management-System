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
import { Trash2, Tag, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { CreateCategoriaModal } from "@/components/create-categoria-modal";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { api } from "@/lib/api";
import { ICategoria } from "@/types/interface";
import AlertGlobal from "@/components/alertGlobal";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [idParaExcluir, setIdParaExcluir] = useState<number>(0);
  const [tamanho, setTamanho] = useState<number>();
  const [categoriaInput, setCategoriaInput] = useState<string>("");

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  /* GARREGAR CATEGORIAS */
  const carregarCategorias = async () => {
    try {
      const response = await api.get(`/categoria?nome=${categoriaInput}`)

      setCategorias(response.data)
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';

      toast.error("Erro ao carregar categorias")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregarCategorias() }, [categoriaInput])

  const handleDelete = async (id: number, length: number) => {
    try {
      await api.delete(`/categoria/${String(id)}`)
      toast.success("Categoria excluída com sucesso")
      carregarCategorias()
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';
      
      const msm = error.response?.data?.message || "Erro ao excluir categoria";
      setMessage(msm);
      setIsOpen(true);
    } finally {
      setIsAlertOpen(false)
    }
  }

  const open = (id: number, t: number) => {
    setIdParaExcluir(id);
    setTamanho(t)
    setIsAlertOpen(true);

  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <SidebarTrigger className="mt-2" />
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Tag className="text-primary" /> Categorias
            </h1>
            <p className="text-muted-foreground text-sm">Organize seu acervo por gêneros ou temas.</p>
          </div>
        </div>
        <CreateCategoriaModal onSucesso={carregarCategorias} />
      </div>


      <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Buscar por categoria..."
            value={categoriaInput}
            onChange={(t) => setCategoriaInput(t.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[80px]">  </TableHead>
              <TableHead>Nome da Categoria</TableHead>
              <TableHead>Números de livros associado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10">
                    <Loader2 className="animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : categorias.map((cat: ICategoria, index: number) => (
                <TableRow key={cat.id}>

                  <TableCell className="text-muted-foreground">#{index + 1}</TableCell>
                  <TableCell className="font-medium">{cat.nome}</TableCell>
                  <TableCell className="font-medium">
                    {cat.livros?.length > 0 ? `${cat.livros?.length} - livros associado` : 'Nenhum livro associado'}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-red-50 cursor-pointer"
                      onClick={() => {
                        open(cat.id, cat.livros?.length)
                      }}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>

      {/* Modal Único de Exclusão (Fora do Loop) */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        {
          isOpen && <AlertGlobal isOpen={isOpen} setIsOpen={() => setIsOpen(false)} message={message} titulo="Erro" />
        }
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              {tamanho && tamanho > 0 ? 'Categoria contem livros associado não pode ser deletado' : 'Deletar categoria?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {
              tamanho === 0 ? (
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 cursor-pointer"
                  onClick={() => idParaExcluir && handleDelete(idParaExcluir, tamanho)}
                >
                  Confirmar Exclusão
                </AlertDialogAction>
              ) : (null)
            }
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}