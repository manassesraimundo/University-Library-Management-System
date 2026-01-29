'use client'

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Book, Bookmark, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { IEmprestimo, IMembro, IReserva } from "@/types/interface";

interface IMembroDetalhesProps {
  matricula: string | null
  isOpen: boolean
  onClose: () => void
}

export function MembroDetalhesModal({ matricula, isOpen, onClose }: IMembroDetalhesProps) {
  const [membro, setMembro] = useState<IMembro | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && matricula) {
      const carregarDetalhes = async () => {
        setLoading(true)
        try {
          const response = await api.get(`/membros/${matricula}`)
          // Ajustado para pegar o primeiro item se for um array
          setMembro(Array.isArray(response.data) ? response.data[0] : response.data)
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" /> Detalhes do Membro
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : membro ? (
          <div className="space-y-6">
            {/* Tabela de Dados Cadastrais */}
            <div className="rounded-md border">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold bg-slate-50 w-32">Nome</TableCell>
                    <TableCell>{membro.usuario?.nome || "Sem usuário vinculado"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold bg-slate-50">Matrícula</TableCell>
                    <TableCell className="font-mono text-primary">{membro.matricula}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold bg-slate-50">Status</TableCell>
                    <TableCell>
                      <Badge variant={membro.ativo ? "success" : "destructive"}>
                        {membro.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold bg-slate-50">Cadastro em</TableCell>
                    <TableCell>
                      {membro.criadoEm ? new Date(membro.criadoEm).toLocaleDateString('pt-BR') : "---"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Tabela de Empréstimos Ativos */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold flex items-center gap-2 px-1">
                <Book size={16} className="text-blue-500" /> Livros em Posse
              </h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead className="text-right">Prazo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {membro.emprestimos?.length > 0 ? (
                      membro.emprestimos.map((emp: IEmprestimo) => (
                        <TableRow key={emp.id}>
                          <TableCell className="text-xs font-medium">{emp.livro.titulo}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {emp.dataPrevista ? new Date(emp.dataPrevista).toLocaleDateString('pt-BR') : "---"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground italic h-12">
                          Nenhum empréstimo ativo.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Tabela de Reservas */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold flex items-center gap-2 px-1">
                <Bookmark size={16} className="text-orange-500" /> Reservas Pendentes
              </h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Livro</TableHead>
                      <TableHead className="text-right">Posição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {membro.reservas?.length > 0 ? (
                      membro.reservas.map((res: IReserva) => (
                        <TableRow key={res.id}>
                          <TableCell className="text-xs font-medium">{res.livro.titulo}</TableCell>
                          <TableCell className="text-right text-xs">Aguardando</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground italic h-12">
                          Nenhuma reserva ativa.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}