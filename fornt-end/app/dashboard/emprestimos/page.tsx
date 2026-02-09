'use client'

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, Search } from "lucide-react";
import { CreateEmprestimoModal } from "@/components/create-emprestimo-modal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { IEmprestimo } from "@/types/interface";
import AlertGlobal from "@/components/alertGlobal";

export default function EmprestimosPage() {
  const [emprestimos, setEmprestimos] = useState<IEmprestimo[]>([]);
  const [status, setStatus] = useState<string>('ativos');
  const [input, setInput] = useState<string>("");

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const carregarDados = useCallback(async () => {
    try {
      const isMembroSearch = input.length === 8;
      let endpoint = "";

      // Mapeamento dinâmico de endpoints
      const routes = {
        ativos: isMembroSearch ? `/emprestimos/${input}` : '/emprestimos/todos',
        atrasados: isMembroSearch ? `/emprestimos/${input}/atrasos` : '/emprestimos/todos/atrasos',
        todos: isMembroSearch ? `/emprestimos/${input}/historico` : '/emprestimos/historico',
      };

      endpoint = routes[status as keyof typeof routes];
      const response = await api.get(endpoint);

      const data = status === 'ativos' && isMembroSearch
        ? response.data.filter((emp: any) => !emp.dataDevolucao && emp.dataPrevista > new Date())
        : response.data;

      setEmprestimos(data);
    } catch (error: any) {
      if (error.response?.status === 401) window.location.href = '/login';
      const msg = error.response?.data.message || "Erro ao sincronizar dados com o servidor";
      setMessage(msg);
      setIsOpen(true);
    }
  }, [status, input]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return (
    <div className="p-6 space-y-6">
      {
        isOpen && <AlertGlobal isOpen={isOpen} setIsOpen={() => setIsOpen(false)} message={message} titulo="Erro" />
      }
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="text-2xl font-bold">Fluxo de Empréstimos</h1>
        </div>
        <CreateEmprestimoModal onSucesso={carregarDados} />
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 ml-2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Buscar por empréstimo do membro pelo número de matricula..."
            value={input}
            onChange={(t) => setInput(t.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue={status} onValueChange={setStatus} className="w-full">
        <TabsList>
          <TabsTrigger value="ativos">Ativos</TabsTrigger>
          <TabsTrigger value="atrasados">Atrasados</TabsTrigger>
          <TabsTrigger value="todos">Histórico Total</TabsTrigger>
        </TabsList>

        <TabsContent value={status} className="bg-white border rounded-xl p-4 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livro</TableHead>
                <TableHead>Membro</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Data Empréstimo</TableHead>
                <TableHead>Devolução Prevista</TableHead>
                <TableHead>Data da Devolução</TableHead>
                <TableHead>Número de renovações</TableHead>
                {status !== 'ativos' && status !== 'atrasados' && (<TableHead>Multa</TableHead>)}
                {status !== 'todos' && (<TableHead className="text-right">Ações</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                emprestimos.length !== 0 ? emprestimos.map((emp: IEmprestimo) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.exemplar.livro?.titulo}</TableCell>
                    <TableCell>{emp.membro?.matricula}</TableCell>
                    <TableCell>{emp.membro?.usuario?.nome}</TableCell>
                    <TableCell>{new Date(emp.dataEmprestimo).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        {(() => {
                          const agora = new Date();
                          const prevista = new Date(emp.dataPrevista);
                          const diffMs = prevista.getTime() - agora.getTime();
                          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                          if (diffDays === 0) {
                            const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
                            if (diffHours <= 1) {
                              const diffMint = Math.ceil(diffMs / (1000 * 60));
                              return `${diffMint}min`;
                            }
                            return `${diffHours}h`;
                          }
                          return new Date(emp.dataPrevista).toLocaleDateString();
                        })()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        {emp.dataDevolucao && new Date(emp.dataDevolucao).toLocaleDateString()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        {emp.renovacoes}
                      </Badge>
                    </TableCell>
                    {
                      status === 'todos' && (
                        <TableCell>
                          <Badge variant="outline" className="border-blue-200 text-blue-700">
                            {new Intl.NumberFormat('pt-AO', {
                              style: 'currency',
                              currency: 'AOA',
                            }).format(emp.multa?.valor || 0)}
                          </Badge>
                        </TableCell>
                      )
                    }
                    {
                      status !== 'todos' && (
                        <TableCell className="text-right space-x-2">
                          {
                            status !== 'atrasados' && (
                              <Renovar carregarEmprestimos={carregarDados} emprestimoId={emp.id} />
                            )
                          }
                          <Devolver
                            emprestimoId={emp.id}
                            carregarEmprestimos={carregarDados}
                            setStatus={() => setStatus('ativos')}
                          />
                        </TableCell>
                      )
                    }
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      Nenhum empréstimos encontrado.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface IDevolverPro {
  emprestimoId: number
  carregarEmprestimos: () => void
  setStatus: () => void
}
function Devolver({ emprestimoId, carregarEmprestimos, setStatus }: IDevolverPro) {
  const [open, setOpen] = useState(false);
  const [multa, setMulta] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const executarFluxo = async () => {
    setLoading(true);
    try {
      if (multa === null) {
        const res = await api.post('/emprestimos/devolucao', { emprestimoId });
        const valorMulta = res.data.multa;

        if (valorMulta > 0) {
          setMulta(valorMulta);
          toast.info("Livro recebido. Multa pendente identificada.");
        } else {
          toast.success("Devolução concluída com sucesso!");
          finalizar();
        }
      } else {
        await api.put(`/emprestimos/multa/pagar/${emprestimoId}`);
        toast.success("Multa paga e fluxo encerrado!");
        finalizar();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro na operação"
      setMessage(msg);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const finalizar = () => {
    setOpen(false);
    setMulta(null);
    setStatus();
    carregarEmprestimos();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {error && (
        <AlertGlobal
          isOpen={error}
          setIsOpen={() => setError(false)}
          message={message}
          titulo="Erro"
        />
      )}
      <AlertDialogTrigger asChild>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
          <CheckCircle className="mr-2 h-4 w-4" /> Devolver
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{multa !== null ? "Pagamento de Multa" : "Confirmar Recebimento"}</AlertDialogTitle>
          <AlertDialogDescription>
            {
              multa !== null ? (
                <p>O sistema calculou uma multa de <strong>{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(multa)}</strong>. Deseja confirmar o pagamento agora?</p>
              ) : "Certifique-se de que o exemplar está em boas condições antes de confirmar."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setMulta(null)}>Cancelar</AlertDialogCancel>
          <Button
            onClick={executarFluxo}
            disabled={loading}
            className={multa !== null ? "bg-blue-600 hover:bg-blue-700 cursor-pointer" : "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"}
          >
            {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {multa !== null ? "Pagar e Finalizar" : "Confirmar Devolução"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface IRenovar {
  emprestimoId: number
  carregarEmprestimos: () => void
}

function Renovar({ emprestimoId, carregarEmprestimos }: IRenovar) {
  const [open, setOpen] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleRenovacao = async () => {
    setLoading(true)
    try {
      await api.post('/emprestimos/renovar', {
        emprestimoId: emprestimoId
      })

      toast.success("Prazo renovado com sucesso!")
      carregarEmprestimos()
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';

      const msg = error.response?.data?.message || "Erro ao renovar"
      setMessage(msg);
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {error && (
        <AlertGlobal
          isOpen={error}
          setIsOpen={() => setError(false)}
          message={message}
          titulo="Erro"
        />
      )}

      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer"
        >
          <RefreshCw className="mr-2 h-3 w-3" /> Renovar
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar</AlertDialogTitle>
          <AlertDialogDescription>
            Confirmar a renovação do prazo de devolução.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleRenovacao}
            className="bg-green-600 hover:bg-green-700 cursor-pointer"
          >
            Confirmar Renovação
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}