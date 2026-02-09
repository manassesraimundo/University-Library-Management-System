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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import AlertGlobal from "./alertGlobal";

export function CreateCategoriaModal({ onSucesso }: { onSucesso: () => void }) {
  const [nome, setNome] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleSalvar = async () => {
    if (!nome) return toast.error("O nome é obrigatório")
    setLoading(true)
    try {
      await api.post('/categoria', { nome })
      toast.success("Categoria criada!")
      setNome("")
      setOpen(false)
      onSucesso()
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';
      
      setMessage(error.response?.data?.message || "Erro ao criar categoria");
      setIsOpen(true);
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isOpen && <AlertGlobal isOpen={isOpen} setIsOpen={() => setIsOpen(false)} message={message} titulo="Erro Multa" />}
      <DialogTrigger asChild>
        <Button className="gap-2 cursor-pointer"><Plus size={18} /> Nova Categoria</Button>
      </DialogTrigger>
      <DialogContent aria-describedby="">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Categoria</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="cat-nome">Nome da Categoria</Label>
          <Input
            id="cat-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Suspense, Biografia, Acadêmico..."
          />
        </div>
        <DialogFooter>
          <Button className="cursor-pointer" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="cursor-pointer" variant="success" onClick={handleSalvar} disabled={loading}>
            {loading ? "Salvando..." : "Criar Categoria"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}