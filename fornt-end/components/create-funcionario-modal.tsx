'use client'

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  Loader2,
  Shield,
  Mail,
  Lock,
  User
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Role } from "@/types/enums";
import AlertGlobal from "./alertGlobal";

export function CreateFuncionarioModal({ onSucesso }: { onSucesso: () => void }) {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);

  // Estado manual do formulário
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    role: Role.BIBLIOTECARIO
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.email || !formData.senha) {
      return toast.error("Por favor, preencha todos os campos.")
    }

    setLoading(true)
    try {
      await api.post("/usuarios", formData)

      toast.success("Funcionário cadastrado com sucesso!")

      setFormData({ nome: "", email: "", senha: "", role: Role.BIBLIOTECARIO })
      setOpen(false)
      onSucesso()
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';
      
      setMessage(error.response?.data?.message || "Erro ao criar funcionário");
      setIsError(true);
    } finally {
      setLoading(false)
    }
  }

  if (isError) {
    return <AlertGlobal
      isOpen={isError}
      setIsOpen={() => setIsError(false)}
      message={message}
      titulo="Erro ao cadastrar funcionário"
    />
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary cursor-pointer">
          <UserPlus size={18} /> Novo Funcionário
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Funcionário</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar uma conta de acesso ao sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="grid gap-5 py-4">
          {/* CAMPO NOME */}
          <div className="grid gap-2">
            <Label htmlFor="nome" className="flex items-center gap-2">
              <User size={14} className="text-muted-foreground" /> Nome Completo
            </Label>
            <Input
              id="nome"
              placeholder="Ex: Carlos Alberto"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          {/* CAMPO EMAIL */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail size={14} className="text-muted-foreground" /> E-mail Profissional
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="carlos@empresa.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* CAMPO SENHA */}
          <div className="grid gap-2">
            <Label htmlFor="pass" className="flex items-center gap-2">
              <Lock size={14} className="text-muted-foreground" /> Senha Inicial
            </Label>
            <Input
              id="pass"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
            />
          </div>

          {/* CAMPO ROLE */}
          <div className="grid gap-2 justify-end">
            <Label className="flex items-center gap-2">
              <Shield size={14} className="text-muted-foreground" /> Nível de Acesso
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: Role) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Selecione o cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.ADMIN}>Administrador</SelectItem>
                <SelectItem value={Role.BIBLIOTECARIO}>Bibliotecário</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                "Confirmar Cadastro"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}