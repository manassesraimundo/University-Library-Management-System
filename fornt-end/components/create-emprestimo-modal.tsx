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
  const [livroNomeSel, setLivroNomeSel] = useState<string>("");
  const [membroMatricula, setMembroMatricula] = useState<string>("");
  const [titulo, setTitulo] = useState<string>("");
  const [openLivro, setOpenLivro] = useState<boolean>(false);
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
      toast.error('Erro ao carregar acervo.')
    }
  }

  useEffect(() => {
    pegarLivrosDisponiveis()
  }, [isDialogOpen, titulo, isOpen])

  const handleSubmit = async () => {
    if (!livroNomeSel || !membroMatricula) {
      return toast.warning("Preencha todos os campos.")
    }

    setIsSubmitting(true)
    try {
      await api.post('/emprestimos', {
        livroId: Number(livroNomeSel),
        matricula: membroMatricula
      })

      toast.success("Empréstimo registrado com sucesso!")

      // Limpar estados
      setLivroNomeSel("")
      setMembroMatricula("")
      setIsDialogOpen(false) // Fecha o modal

      if (onSucesso)
        onSucesso() // Atualiza a lista na página pai
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro ao registrar empréstimo"
      setMessage(msg)
      setIsOpen(true)

      // toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isOpen) {
    return <AlertGlobal
      isOpen={isOpen}
      setIsOpen={() => setIsOpen(false)}
      message={message}
      titulo="Empréstimo"
    />
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus size={18} /> Novo Empréstimo</Button>
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
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? "Processando..." : "Finalizar Empréstimo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}