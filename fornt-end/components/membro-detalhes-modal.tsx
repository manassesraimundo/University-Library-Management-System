'use client'

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface MembroDetalhesProps {
    matricula: string | null
    isOpen: boolean
    onClose: () => void
}

export function MembroDetalhesModal({ matricula, isOpen, onClose }: MembroDetalhesProps) {
    const [membro, setMembro] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && matricula) {
            const carregarDetalhes = async () => {
                setLoading(true)
                try {
                    const response = await api.get(`/membros/${matricula}`)
                    setMembro(response.data[0])
                } catch (error: any) {
                    toast.error("Não foi possível carregar os detalhes.")
                    onClose()
                } finally {
                    setLoading(false)
                }
            }
            carregarDetalhes()
        }
    }, [isOpen, matricula])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Detalhes do Membro</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) :
                    membro ? (
                        <div className="grid gap-6 py-4">
                            <div className="flex justify-between items-start border-b pb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{membro.usuario?.nome}</h3>
                                    <p className="text-sm text-slate-500">{membro.usuario?.email}</p>
                                </div>
                                <Badge variant={membro.ativo ? "success" : "destructive"}>
                                    {membro.ativo ? "Ativo" : "Inativo"}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-slate-500">Matrícula</Label>
                                    <p className="font-mono font-medium">{membro.matricula}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-slate-500">Nome</Label>
                                    <p className="font-medium">
                                        {membro.usuario?.nome}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-slate-500">E-mail</Label>
                                    <p className="font-mono font-medium">{membro.usuario?.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-slate-500">Membro desde</Label>
                                    <p className="font-medium">
                                        {new Date(membro.criadoEm).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>

                            {/* Exemplo de histórico de empréstimos caso seu back retorne */}
                            <div className="space-y-2">
                                <Label className="text-slate-500">Livros em posse</Label>
                                {membro.emprestimos?.length > 0 ? (
                                    <ul className="text-sm space-y-1">
                                        {membro.emprestimos.map((emp: any) => (
                                            <li key={emp.id} className="p-2 bg-slate-50 rounded border">
                                                {emp.livro.titulo}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">Nenhum livro pendente.</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-500">Livros em reserva</Label>
                                {membro.reservas?.length > 0 ? (
                                    <ul className="text-sm space-y-1">
                                        {membro.reservas.map((emp: any) => (
                                            <li key={emp.id} className="p-2 bg-slate-50 rounded border">
                                                {emp.livro.titulo}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">Nenhum livro na reserva.</p>
                                )}
                            </div>
                        </div>
                    ) : null
                }
            </DialogContent>
        </Dialog>
    )
}