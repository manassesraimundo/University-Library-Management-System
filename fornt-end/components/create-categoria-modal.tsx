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

export function CreateCategoriaModal({ onSucesso }: { onSucesso: () => void }) {
  const [nome, setNome] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSalvar = async () => {
    if (!nome) return toast.error("O nome é obrigatório")
    setLoading(true)
    try {
      await api.post('/categoria', { nome })
      toast.success("Categoria criada!")
      setNome("")
      setOpen(false)
      onSucesso()
    } catch (error) {
      toast.error("Erro ao criar categoria")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus size={18} /> Nova Categoria</Button>
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
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleSalvar} disabled={loading}>
            {loading ? "Salvando..." : "Criar Categoria"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}