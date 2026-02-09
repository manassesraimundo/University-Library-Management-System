'use client'

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import AlertGlobal from "./alertGlobal";

export function CreateAutorModal({ onSucesso }: { onSucesso: () => void }) {
  const [nome, setNome] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleSalvar = async () => {
    try {
      const res = await api.post('autor', { nome });
      if (res.status === 201)
        toast.success('Autor adicionado com sucesso.');
      onSucesso()
      setOpen(false)
      setNome('')
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';
      
      setMessage(error.response?.data?.message || "Erro ao cadastrar");
      setIsOpen(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isOpen && <AlertGlobal isOpen={isOpen} setIsOpen={() => setIsOpen(false)} message={message} titulo="Erro Multa" />}
      <DialogTrigger asChild>
        <Button className="gap-2 cursor-pointer"><UserPlus size={18} /> Novo Autor</Button>
      </DialogTrigger>
      <DialogContent aria-describedby="">
        <DialogHeader><DialogTitle>Cadastrar Autor</DialogTitle></DialogHeader>
        <div className="py-4">
          <Label>Nome Completo</Label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: J.K. Rowling"
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button className="cursor-pointer" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="cursor-pointer" variant="success" onClick={handleSalvar}>Salvar Autor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}