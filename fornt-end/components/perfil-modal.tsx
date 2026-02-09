'use client'

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, User, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api"
import { DialogDescription } from "@radix-ui/react-dialog";

interface IPerfilModalProps {
  isOpen: boolean
  onClose: () => void
}

interface IFormData {
  nome: string,
  email: string,
  antiga: string,
  nova: string,
  confirmar: string
}

export function PerfilModal({ isOpen, onClose }: IPerfilModalProps) {
  const { user, loading } = useAuth()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [alterarSenha, setAlterarSenha] = useState<boolean>(false);
  const [formData, setFormData] = useState<IFormData>({
    nome: "",
    email: "",
    antiga: "",
    nova: "",
    confirmar: ""
  })

  useEffect(() => {

    if (user) {
      setFormData({ ...formData, nome: user.nome, email: user.email })
    }

  }, [user, isOpen, loading])

  const handleUpdate = async () => {
    setIsLoading(true)
    try {
      const res = await api.patch(`/usuarios/${user?.id}`, formData)

      toast.success("Perfil atualizado com sucesso!")

      onClose()
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';
      
      toast.error(error.response?.data?.message || "Erro ao atualizar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Meu Perfil</DialogTitle>
          <DialogDescription className="sr-only">
            Visualize e edite suas informações de perfil e senha.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* Avatar Grande */}
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarFallback className="text-2xl font-bold bg-primary/5">
                {user?.nome?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {
              user?.role === 'ADMIN' && (
                <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full border-2 border-white">
                  <ShieldCheck size={16} />
                </div>
              )
            }
          </div>

          <div className="grid w-full gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2">
                <User size={14} className="text-muted-foreground" /> Nome Completo
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail size={14} className="text-muted-foreground" /> E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-slate-50 cursor-not-allowed"
              />
            </div>

            {
              alterarSenha &&
              (
                <FormSenha
                  formData={formData}
                  setFormData={setFormData}
                />
              )
            }
            <div className="flex flex-1 justify-end">
              <Button
                variant='secondary'
                onClick={() => setAlterarSenha(!alterarSenha)}
                className="cursor-pointer"
              >
                {!alterarSenha ? 'Alterar senha' : 'Cancelar'}
              </Button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-dashed text-center">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Nível de Acesso</p>
              <p className="text-sm font-semibold text-primary">{user?.role}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading} className="gap-2 bg-green-600 hover:bg-green-700">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface IFormSenha {
  formData: IFormData;
  setFormData: ({ nome, email, antiga, nova, confirmar }: IFormData) => void;
}

function FormSenha({ formData, setFormData }: IFormSenha) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="antiga" className="flex items-center gap-2">
          Senha antiga
        </Label>
        <Input
          id="antiga"
          value={formData.antiga}
          onChange={(e) => setFormData({ ...formData, antiga: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nova" className="flex items-center gap-2">
          Nova senha
        </Label>
        <Input
          id="nova"
          value={formData.nova}
          onChange={(e) => setFormData({ ...formData, nova: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmar" className="flex items-center gap-2">
          Confirmar senha
        </Label>
        <Input
          id="confirmar"
          value={formData.confirmar}
          onChange={(e) => setFormData({ ...formData, confirmar: e.target.value })}
        />
      </div>
    </>
  )
}