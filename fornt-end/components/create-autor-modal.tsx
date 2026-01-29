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

export function CreateAutorModal({ onSucesso }: { onSucesso: () => void }) {
  const [nome, setNome] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const handleSalvar = async () => {
    try {
      const res = await api.post('autor', {nome});
      if (res.status === 201)
        toast.success('Autor adicionado com sucesso.');
      onSucesso()
      setOpen(false)
      setNome('')
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao cadastrar")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><UserPlus size={18} /> Novo Autor</Button>
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
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleSalvar}>Salvar Autor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}