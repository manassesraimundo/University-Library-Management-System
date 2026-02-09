'use client'

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, Filter } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { TipoMembro } from "@/types/enums";
import AlertGlobal from "./alertGlobal";

export function CreateMembroModal({ onMembroCriado }: { onMembroCriado: () => void }) {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [matricula, setMatricula] = useState<string>("");
  const [tipoMembro, setTipoMembro] = useState<string>(TipoMembro.ESTUDANTE);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const onSubmit = async () => {
    setLoading(true)
    try {
      await api.post('/membros', {
        matricula,
        tipo: tipoMembro
      })

      toast.success("Membro cadastrado com sucesso!")

      setOpen(false)
      onMembroCriado()
    } catch (error: any) {
      const mensagem = error.response?.data?.message || "Erro ao cadastrar membro"
      if (error.response?.status === 401) {
        window.location.href = '/login'
      }

      setMessage(mensagem);
      setIsOpen(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {
        isOpen && <AlertGlobal
          isOpen={isOpen}
          setIsOpen={() => setIsOpen(false)}
          message={message}
          titulo="Error"
        />
      }
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 cursor-pointer">
          <UserPlus className="h-4 w-4" /> Novo Membro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Membro</DialogTitle>
          <DialogDescription>
            Insira as informações do leitor para liberar o acesso ao sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="matricula">Número de Matrícula</Label>
            <Input
              id="matricula"
              placeholder="Ex: 202300123"
              value={matricula}
              onChange={(t) => setMatricula(t.target.value)}
            />
          </div>

          <div className="flex flex-1 justify-end">
            <Select value={tipoMembro} onValueChange={setTipoMembro}>
              <SelectTrigger className="w-[180px] cursor-pointer">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TipoMembro.ESTUDANTE}>Estudante</SelectItem>
                <SelectItem value={TipoMembro.PROFESSOR}>Professor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={onSubmit}
              disabled={loading}
              className="min-w-[100px] bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Cadastro"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}