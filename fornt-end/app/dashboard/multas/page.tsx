'use client'

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, DollarSign, CheckCircle2, AlertCircle, Loader2, Filter } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MultasPage() {
  const [multas, setMultas] = useState([]);
  const [prossecado, setProssecado] = useState([]);
  const [atrasado, setAtrasado] = useState([]);
  const [totalPago, setTotalPago] = useState(0);
  const [totalPendente, setTotalPendente] = useState(0);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [pago, setPago] = useState("atrasado");

  const carregarMultas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/multas`, {
        params: {
          matricula: busca
        }
      });

      const pros = response.data.filter((m: any) => m.paga)
      setProssecado(pros);

      const atr = response.data.filter((m: any) => !m.paga)
      setAtrasado(atr);
      setMultas(atr)

      // Cálculo do total pendente para o resumo
      const totalPago = response.data
        .filter((m: any) => m.paga)
        .reduce((acc: number, curr: any) => acc + curr.valor, 0);
      setTotalPago(totalPago);

      // Cálculo do total pendente para o resumo
      const totalPendente = response.data
        .filter((m: any) => !m.paga)
        .reduce((acc: number, curr: any) => acc + curr.valor, 0);
      setTotalPendente(totalPendente)
    } catch (error) {
      toast.error("Erro ao carregar multas");
    } finally {
      setLoading(false);
    }
  }, [busca]);

  // Efeito único para carregar dados (com debounce para não sobrecarregar a API ao digitar)
  useEffect(() => {
    const handler = setTimeout(() => {
      carregarMultas();
    }, 400);
    return () => clearTimeout(handler);
  }, [carregarMultas]);

  useEffect(() => {
    if (pago === 'processado')
      setMultas(prossecado)
    else
      setMultas(atrasado)
  }, [pago]);

  const handleQuitarMulta = async (id: number) => {
    try {
      await api.put(`/multas/pagar/${id}`);
      toast.success("Pagamento registrado!");
      carregarMultas();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao processar");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold">Gestão de Multas</h1>
            <p className="text-muted-foreground text-sm">Controle de débitos e pagamentos dos membros.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-green-50 border border-green-100 px-4 py-2 rounded-lg text-green-700 flex items-center gap-3">
            <CheckCircle2 size={20} />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] uppercase font-bold opacity-70">Total Processado</span>
              <span className="text-sm font-black">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'AOA' }).format(totalPago)}
              </span>
            </div>
          </div>
          <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-lg text-red-700 flex items-center gap-3">
            <AlertCircle size={20} />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] uppercase font-bold opacity-70">Total Pendente</span>
              <span className="text-sm font-black">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'AOA' }).format(totalPendente)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por matrícula ou nome..."
            className="pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <Select value={pago} onValueChange={setPago}>
          <SelectTrigger className="w-[180px] cursor-pointer">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Etiqueta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={"atrasado"}>Atrasado</SelectItem>
            <SelectItem value={"processado"}>Processado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Livro Referente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento Original</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <Loader2 className="animate-spin mx-auto text-slate-400" />
                </TableCell>
              </TableRow>
            ) : multas.length > 0 ? multas.map((multa: any) => (
              <TableRow key={multa.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{multa.emprestimo?.membro?.usuario?.nome || "Membro não encontrado"}</span>
                    <span className="text-xs text-muted-foreground">{multa.emprestimo?.membro?.matricula}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 italic text-sm">
                  {multa.emprestimo?.exemplar?.livro?.titulo || "Título indisponível"}
                </TableCell>
                <TableCell className="font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'AOA' }).format(multa.valor)}
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {multa.emprestimo?.dataPrevista ? new Date(multa.emprestimo.dataPrevista).toLocaleDateString() : '---'}
                </TableCell>
                <TableCell>
                  <Badge variant={multa.paga ? "success" : "destructive"}>
                    {multa.paga ? "Paga" : "Pendente"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {!multa.paga ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50 border-green-200">
                          <DollarSign className="mr-1 h-4 w-4" /> Baixar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Pagamento?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Confirmar recebimento de multa do membro <strong>{multa.emprestimo?.membro?.usuario?.nome}</strong>?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Voltar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleQuitarMulta(multa.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <div className="text-green-500 flex items-center justify-end gap-1 text-sm font-medium pr-4">
                      <CheckCircle2 size={16} /> Pago
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                  Nenhuma multa encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}