'use client'

import { useState } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShieldCheck, UserCog, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api"

interface TooglePermicaoProps {
  funcionario: any;
  onSucesso: () => void;
}
export function TooglePermicao({ funcionario, onSucesso }: TooglePermicaoProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState(funcionario?.role || "BIBLIOTECARIO")

  const handleUpdateRole = async () => {
    setLoading(true)
    try {
      await api.patch(`/usuarios/${funcionario.id}/permincoes`, { role })
      toast.success("Permissão atualizada!")
      onSucesso()
      setOpen(false)
    } catch (error) {
      toast.error("Erro ao alterar permissão.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <UserCog size={14} className="text-slate-500" />
          <span>Alterar Permissões</span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="text-primary" size={20} />
            Alterar Permissões
          </DialogTitle>
          <DialogDescription>
            Defina o nível de acesso para <strong>{funcionario?.nome}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={role}
            onValueChange={setRole}
            className="grid gap-4 w-full"
          >
            {/* Opção ADMIN */}
            <Label
              htmlFor="admin"
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${role === "ADMIN" ? "border-primary bg-primary/5" : "hover:bg-slate-50"
                }`}
            >
              <RadioGroupItem value="ADMIN" id="admin" className="mt-1" />
              <div className="grid gap-1">
                <span className="font-bold">Administrador</span>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  Acesso total ao sistema, relatórios financeiros e gestão de funcionários.
                </span>
              </div>
            </Label>

            {/* Opção BIBLIOTECARIO */}
            <Label
              htmlFor="biblio"
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${role === "BIBLIOTECARIO" ? "border-primary bg-primary/5" : "hover:bg-slate-50"
                }`}
            >
              <RadioGroupItem value="BIBLIOTECARIO" id="biblio" className="mt-1" />
              <div className="grid gap-1">
                <span className="font-bold">Bibliotecário</span>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  Gestão de livros, empréstimos, reservas e membros.
                </span>
              </div>
            </Label>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateRole}
            disabled={loading || role === funcionario?.role}
            className="gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar Alteração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}