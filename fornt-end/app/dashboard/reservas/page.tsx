'use client'

import { useState, useEffect, useCallback } from "react";
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
import AlertGlobal from "@/components/alertGlobal";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/create-livro-form";

export default function ReservasPage() {
  const [reservas, setReservas] = useState<IReserva[]>([]);
  const [busca, setBusca] = useState<string>("");
  const [statusReserva, setStatusReseva] = useState<string>("true");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = statusReserva === "true" ? "/reservas/todos?status=true" : "/reservas/todos?status=false";

      if (busca.length === 8) {
        endpoint = `/reservas/${busca}`;
      }

      const response = await api.get(endpoint);
      setReservas(response.data);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro ao sincronizar reservas"
      setMessage(msg);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [statusReserva, busca]);

  useEffect(() => {
    if (busca.length === 0 || busca.length === 8) {
      carregarDados();
    }
  }, [carregarDados]);

  return (
    <div className="p-6 space-y-6">
      {error && (
        <AlertGlobal
          isOpen={error}
          setIsOpen={() => setError(false)}
          message={message}
          titulo="Erro"
        />
      )}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="text-2xl font-bold">Reservas de Livros</h1>
        </div>
        <CreateReservaModal onSucesso={carregarDados} />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Digite a matrícula (8 dígitos)..."
            className="pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Select value={statusReserva} onValueChange={setStatusReseva}>
          <SelectTrigger className="w-[180px] cursor-pointer">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Ativas</SelectItem>
            <SelectItem value="false">Não ativas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Livro</TableHead>
              <TableHead>Membro</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              {statusReserva === 'true' && <TableHead>Posição</TableHead>}
              {statusReserva === 'true' && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">Carregando...</TableCell></TableRow>
            ) : reservas.map((reserva) => (
              <TableRow key={reserva.id}>
                <TableCell className="font-medium">{reserva.livro?.titulo}</TableCell>
                <TableCell>{reserva.membro?.usuario?.nome} ({reserva.membro?.matricula})</TableCell>
                <TableCell>{new Date(reserva.criadaEm).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={reserva.ativa ? 'success' : 'secondary'}>
                    {reserva.ativa ? 'Fila de Espera' : 'Finalizada'}
                  </Badge>
                </TableCell>
                {statusReserva === 'true' && <TableCell className="font-bold">#{reserva.posicao}º</TableCell>}
                <TableCell className="text-right space-x-1">
                  {statusReserva === 'true' && (
                    <>
                      <BotaoCancelar id={reserva.id} onSuccess={carregarDados} />
                      {reserva.posicao === 1 && (
                        <BotaoEmprestarReserva reserva={reserva} onSuccess={carregarDados} />
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function BotaoCancelar({ id, onSuccess }: { id: number, onSuccess: () => void }) {
  const [error, setError] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handle = async () => {
    try {
      await api.put(`/reservas/cancelar/${id}`);
      toast.success("Reserva cancelada");
      onSuccess();
    } catch (e: any) {
      const msg = e.response?.data?.message || "Erro no Cancelar"
      setMessage(msg);
      setError(true);
    }
  };

  return (
    <AlertDialog>
      {error && (
        <AlertGlobal
          isOpen={error}
          setIsOpen={() => setError(false)}
          message={message}
          titulo="Erro"
        />
      )}
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 cursor-pointer">
          <XCircle />
          Cancelar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar Reserva?</AlertDialogTitle>
          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction onClick={handle} className="bg-red-600 hover:bg-red-700 cursor-pointer">Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function BotaoEmprestarReserva({ reserva, onSuccess }: { reserva: IReserva, onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [openSel, setOpenSel] = useState<boolean>(false)
  const [exemplares, setExemplares] = useState([]);
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const carregarExemplares = async () => {
    const res = await api.get(`/livros/${reserva.livroId}/exemplares`);
    setExemplares(res.data.map((ex: any) => ({ id: ex.codigoBarras, nome: ex.codigoBarras })));
  };

  const handleEmprestar = async () => {
    if (!codigo) return toast.error("Selecione um exemplar");
    try {
      await api.post('/emprestimos', {
        livroId: reserva.livroId,
        matricula: reserva.membro?.matricula,
        codigoBarras: codigo
      });
      toast.success("Empréstimo efetuado!");
      setOpen(false);
      onSuccess();
    } catch (e: any) {
      const msg = e.response?.data?.message || "Erro no empréstimo";
      setMessage(msg);
      setError(true);
    }
  };

  useEffect(() => { carregarExemplares() }, [])

  return (
    <AlertDialog open={open} onOpenChange={(val) => { setOpen(val) }}>
      {error && (
        <AlertGlobal
          isOpen={error}
          setIsOpen={() => setError(false)}
          message={message}
          titulo="Erro"
        />
      )}
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-green-600 border-green-700 cursor-pointer">
          <CheckCheck/> Efetuar Empréstimo
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Vincular Exemplar</AlertDialogTitle>
          <AlertDialogDescription>O membro está no topo da fila. Escolha o exemplar físico para entrega:</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label className="mb-2">Exemplares</Label>
          <SearchableSelect
            items={exemplares}
            selected={codigo}
            setSelected={setCodigo}
            open={openSel}
            setOpen={(e) => setOpenSel(e)}
            placeholder="Selecione o código de barras..."
            value={codigo}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleEmprestar} className="bg-green-600 hover:bg-green-700 cursor-pointer">Finalizar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}