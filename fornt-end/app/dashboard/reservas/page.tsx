'use client'

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XCircle, Search, Filter, CheckCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CreateReservaModal } from "@/components/create-reserva-modal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { IReserva } from "@/types/interface";

export default function ReservasPage() {
  const [reservas, setReservas] = useState<IReserva[]>([]);
  const [busca, setBusca] = useState<string>("")
  const [statusReserva, setStatusReseva] = useState<string>("true");

  const carregarReservas = async () => {
    try {
      const response = await api.get(`/reservas?status=${statusReserva}`)
      setReservas(response.data)
    } catch (error: any) {
      toast.error("Erro ao carregar reservas")
      if (error.response?.status === 401) {
        window.location.href = '/login'
      }
    }
  }

  const carregarBuscaReservas = async () => {
    try {
      if (busca.length !== 8)
        return;
      const response = await api.get(`/reservas/${busca}`)

      setReservas(response.data)
    } catch (error: any) {
      toast.error("Erro ao carregar reservas")
      if (error.response?.status === 401) {
        window.location.href = '/login'
      }
    }
  }

  useEffect(() => {
    carregarReservas()
  }, [statusReserva])

  useEffect(() => {
    carregarBuscaReservas()
    if (!busca || busca.length !== 8)
      carregarReservas()
  }, [busca])

  const handleCancelarReserva = async (id: number) => {
    try {
      await api.put(`/reservas/cancelar/${id}`)

      toast.success("Reserva cancelada com sucesso!")

      carregarReservas()
    } catch (error: any) {
      const mensagem = error.response?.data?.message || "Erro ao cancelar reserva"
      toast.error(mensagem)
    }
  }

  const confirmarReservaParaEmprestimo = async (id: number) => {
    try {
      await api.put(`/reservas/confirmar/${id}`)

      toast.success("Empréstimo realizado com sucesso!")

      carregarReservas()
    } catch (error: any) {
      const mensagem = error.response?.data?.message || "Erro ao cancelar reserva"
      toast.error(mensagem)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold">Reservas de Livros</h1>
            <p className="text-muted-foreground text-sm">Gerencie as solicitações de reserva dos membros.</p>
          </div>
        </div>
        <CreateReservaModal onSucesso={carregarReservas} />
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar por matricula..."
            className="pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Select value={statusReserva} onValueChange={setStatusReseva}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Ativas</SelectItem>
            <SelectItem value="false">Não ativas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Livro</TableHead>
              <TableHead>Matricula</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Data da Reserva</TableHead>
              <TableHead>Status</TableHead>
              {statusReserva === 'true' && <TableHead>Posição</TableHead>}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservas.length !== 0 ? reservas.map((reserva: IReserva) => (
              <TableRow key={reserva.id}>
                <TableCell className="font-medium">{reserva.livro?.titulo}</TableCell>
                <TableCell>{reserva.membro?.matricula}</TableCell>
                <TableCell>{reserva.membro?.usuario?.nome}</TableCell>
                <TableCell>{new Date(reserva.criadaEm).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={reserva.ativa === true ? 'success' : 'default'}>
                    {reserva.ativa === true ? 'Ativo' : 'Não ativo'}
                  </Badge>
                </TableCell>
                {statusReserva === 'true' && <TableCell>{reserva.posicao}</TableCell>}
                <TableCell className="text-right">
                  {reserva.ativa == true && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Cancelar
                          </Button>
                          {
                            reserva.livro.quantidade > 1 && reserva.posicao === 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => confirmarReservaParaEmprestimo(reserva.id)}
                              >
                                <CheckCheck className="mr-2 h-4 w-4" />
                                Efetuar Empréstimo
                              </Button>
                            )
                          }
                        </div>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Cancelamento?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação liberará o livro para outros membros e não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Voltar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCancelarReserva(reserva.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Sim, Cancelar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Nenhum reserva encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}