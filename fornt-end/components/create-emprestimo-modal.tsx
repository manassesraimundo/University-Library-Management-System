'use client'

import { useEffect, useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { SearchableSelect } from "./create-livro-form";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ILivro } from "@/types/interface";
import AlertGlobal from "./alertGlobal";

export function CreateEmprestimoModal({ onSucesso }: { onSucesso: () => void }) {
  const [livros, setLivros] = useState<{ id: number, nome: string }[]>([]);
  const [exemplares, setExemplares] = useState<{id: string, nome: string}[]>([]);
  const [membroMatricula, setMembroMatricula] = useState<string>("");

  const [livroNomeSel, setLivroNomeSel] = useState<string>("");
  const [openLivro, setOpenLivro] = useState<boolean>(false);

  const [openExpempr, setOpenExemplar] = useState<boolean>(false);
  const [codigoBarras, setCodigoBarras] = useState<string>("");

  const [titulo, setTitulo] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false); // Controle manual do Dialog
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [message, setMessage] = useState<string>("");

  const pegarLivrosDisponiveis = async () => {
    try {
      const response = await api.get(`/livros?titulo=${titulo}`, {
        params: {
          status: 'DISPONIVEL'
        }
      })

      const formatados: { id: number, nome: string }[] = response.data.map((l: ILivro) => ({
        id: l.id,
        nome: l.titulo,
      }))
      setLivros(formatados)
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';

      toast.error('Erro ao carregar acervo.')
    }
  }

  const pegarExemplaresByLivro = async () => {
    try {
      const response = await api.get(`/livros/${Number(livroNomeSel)}/exemplares`)

      const formatados: { id: string, nome: string }[] = response.data.map((l: any) => ({
        id: l.codigoBarras,
        nome: l.codigoBarras,
      }));
      setExemplares(formatados)
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';

      toast.error(error.response?.data?.message || 'Erro ao carregar exemplares.')
    }
  }

  useEffect(() => {
    pegarLivrosDisponiveis()
  }, [isDialogOpen, titulo, isOpen])

  useEffect(() => { pegarExemplaresByLivro() }, [livroNomeSel])

  const handleSubmit = async () => {
    if (!livroNomeSel || !membroMatricula) {
      return toast.warning("Preencha todos os campos.")
    }

    setIsSubmitting(true)
    try {
      await api.post('/emprestimos', {
        livroId: Number(livroNomeSel),
        matricula: membroMatricula,
        codigoBarras
      })

      toast.success("Empréstimo registrado com sucesso!")

      // Limpar estados
      setLivroNomeSel("")
      setCodigoBarras("")
      setMembroMatricula("")
      setIsDialogOpen(false) // Fecha o modal

      if (onSucesso)
        onSucesso() // Atualiza a lista na página pai
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';

      const msg = error.response?.data?.message || "Erro ao registrar empréstimo"
      setMessage(msg)
      setIsOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {
        isOpen && <AlertGlobal
          isOpen={isOpen}
          setIsOpen={() => setIsOpen(false)}
          message={message}
          titulo="Empréstimo"
        />
      }
      <DialogTrigger asChild>
        <Button className="gap-2 cursor-pointer"><Plus size={18} /> Novo Empréstimo</Button>
      </DialogTrigger>
      <DialogContent aria-describedby="">
        <DialogHeader>
          <DialogTitle>Registrar Saída de Livro</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label>Selecione o Livro (Disponíveis)</Label>
            <SearchableSelect
              items={livros}
              selected={livroNomeSel}
              setSelected={(e: string) => setLivroNomeSel(e)}
              open={openLivro}
              setOpen={setOpenLivro}
              placeholder="Pesquisar livro pelo título..."
              value={titulo}
              onChangeCapture={() => setTitulo}
            />
          </div>

          <div className="grid gap-2">
            <Label>Codígo do Exemplar</Label>
            <SearchableSelect
              items={exemplares}
              selected={codigoBarras}
              setSelected={(e: string) => setCodigoBarras(e)}
              open={openExpempr}
              setOpen={setOpenExemplar}
              placeholder="Pesquisar por codego de exemplar..."
              value={codigoBarras}
              onChangeCapture={() => setCodigoBarras}
            />
          </div>

          <div className="grid gap-2">
            <Label>Matrícula do Membro</Label>
            <Input
              placeholder="Ex: 2023001"
              value={membroMatricula}
              onChange={(e) => setMembroMatricula(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
          >
            {isSubmitting ? "Processando..." : "Finalizar Empréstimo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}