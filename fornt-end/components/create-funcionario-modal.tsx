'use client'

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UserPlus, Loader2, Shield, Mail, Lock, User } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

export function CreateFuncionarioModal({ onSucesso }: { onSucesso: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Estado manual do formulário
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        senha: "",
        role: "BIBLIOTECARIO"
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

            setFormData({ nome: "", email: "", senha: "", role: "BIBLIOTECARIO" })
            setOpen(false)
            onSucesso()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erro ao criar funcionário")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-primary">
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
                            onValueChange={(value) => setFormData({ ...formData, role: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o cargo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN">Administrador</SelectItem>
                                <SelectItem value="BIBLIOTECARIO">Bibliotecário</SelectItem>
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
                            className="bg-green-600 hover:bg-green-700"
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