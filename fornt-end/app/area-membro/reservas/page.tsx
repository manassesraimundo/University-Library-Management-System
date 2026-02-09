'use client'

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
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
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { IReserva } from "@/types/interface"
import { Bookmark, Calendar, XCircle, Loader2 } from "lucide-react"

export default function MinhasReservasPage() {
  const { membro } = useAuth()
  const [reservas, setReservas] = useState<IReserva[]>([])
  const [loading, setLoading] = useState(true)

  const carregarMinhasReservas = useCallback(async () => {
    if (!membro?.id) return
    
    setLoading(true)
    try {
      const response = await api.get(`/reservas/membro/${membro.matricula}`)
      setReservas(response.data)
    } catch (error) {
      toast.error("Não foi possível carregar suas reservas.")
    } finally {
      setLoading(false)
    }
  }, [membro?.id])

  useEffect(() => {
    carregarMinhasReservas()
  }, [carregarMinhasReservas])

  const handleCancelarMinhaReserva = async (id: number) => {
    try {
      await api.put(`/reservas/cancelar/${id}`)
      toast.success("Reserva cancelada com sucesso.")
      carregarMinhasReservas()
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro ao cancelar."
      toast.error(msg)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bookmark className="text-primary" />
          Minhas Reservas
        </h1>
        <p className="text-muted-foreground text-sm">
          Acompanhe sua posição na fila e gerencie seus pedidos de reserva.
        </p>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Livro</TableHead>
              <TableHead>Data do Pedido</TableHead>
              <TableHead>Posição na Fila</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : reservas.length > 0 ? (
              reservas.map((reserva) => (
                <TableRow key={reserva.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium">
                    {reserva.livro?.titulo}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={14} />
                      {new Date(reserva.criadaEm).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                        reserva.posicao === 1 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {reserva.posicao}º
                      </span>
                      <span className="text-xs text-muted-foreground">lugar</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={reserva.ativa ? "success" : "secondary"}>
                      {reserva.ativa ? "Aguardando" : "Finalizada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {reserva.ativa && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <XCircle className="mr-2 h-4 w-4" />
                            Desistir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancelar Reserva?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Você perderá sua posição na fila para o livro <strong>{reserva.livro?.titulo}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Manter reserva</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleCancelarMinhaReserva(reserva.id)}
                              className="bg-red-600 text-white hover:bg-red-700"
                            >
                              Confirmar Cancelamento
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                  Você não possui nenhuma reserva ativa no momento.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Dica:</strong> Quando você chegar à 1ª posição e o livro estiver disponível, você receberá uma notificação para comparecer à biblioteca e efetuar o empréstimo em até 48 horas.
        </p>
      </div>
    </div>
  )
}