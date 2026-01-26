'use client'

import { useEffect, useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Book, RotateCcw, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { api } from "@/lib/api";

export default function MeusEmprestimosPage() {
  const [emprestimos, setEmprestimos] = useState([])
  const [loading, setLoading] = useState(true)

  const carregarEmprestimos = async () => {
    try {
      const res = await api.get('/emprestimos/meus-emprestimos')
      setEmprestimos(res.data)
    } catch (error) {
      toast.error("Erro ao carregar seus empréstimos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregarEmprestimos() }, [])

  const ativos = emprestimos.filter((e: any) => !e.dataDevolucao)
  const historico = emprestimos.filter((e: any) => e.dataDevolucao)

  const handleRenovar = async (id: string) => {
    toast.message("Renovando empréstimo é na bibiloteca")
    return ;
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meus Empréstimos</h1>
        <p className="text-muted-foreground">Consulte o prazo de devolução e seu histórico de leituras.</p>
      </div>

      <Tabs defaultValue="ativos" className="w-full">
        <TabsList>
          <TabsTrigger value="ativos" className="gap-2">
            Ativos <Badge variant="secondary" className="h-5 px-1.5">{ativos.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        {/* --- ABA DE EMPRÉSTIMOS ATIVOS --- */}
        <TabsContent value="ativos" className="space-y-4">
          {ativos.length === 0 ? (
            <Card className="border-dashed py-12 flex flex-col items-center opacity-60">
              <Book size={48} className="mb-4" />
              <p>Você não possui livros emprestados no momento.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {ativos.map((emp: any) => {
                const isAtrasado = new Date(emp.dataPrevista) < new Date()
                return (
                  <Card key={emp.id} className={isAtrasado ? "border-red-200 bg-red-50/30" : ""}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex gap-4">
                          <div className="h-16 w-12 bg-slate-200 rounded flex items-center justify-center text-slate-400">
                             <Book size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{emp.livro?.titulo}</h3>
                            <p className="text-sm text-muted-foreground">{emp.livro?.auto?.nome}</p>
                            <div className="flex items-center gap-4 mt-2">
                               <div className="flex items-center gap-1 text-xs">
                                 <Calendar size={14} className="text-primary" />
                                 <span>Retirado em: {format(new Date(emp.dataEmprestimo), 'dd/MM/yyyy')}</span>
                               </div>
                               <div className={`flex items-center gap-1 text-xs font-semibold ${isAtrasado ? 'text-red-600' : 'text-orange-600'}`}>
                                 <Clock size={14} />
                                 <span>Devolver até: {format(new Date(emp.dataPrevista), 'dd/MM/yyyy')}</span>
                               </div>
                               <div className={`flex items-center gap-1 text-xs font-semibold ${isAtrasado ? 'text-red-600' : 'text-green-600'}`}>
                                 {/* <Clock size={14} /> */}
                                 <span>
                                    Dias restantes: {
                                        (() => {
                                          const hoje = new Date()
                                          const dataPrevista = new Date(emp.dataPrevista)
                                          const diffTime = dataPrevista.getTime() - hoje.getTime()
                                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                          return isAtrasado ? 0 : diffDays
                                        })()
                                    }
                                 </span>
                               </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                          {isAtrasado && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertCircle size={12} /> Em Atraso
                            </Badge>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 w-full md:w-auto"
                            onClick={() => handleRenovar(emp.id)}
                            disabled={isAtrasado} // Geralmente não permite renovar se já estiver atrasado
                          >
                            <RotateCcw size={14} /> Renovar Prazo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* --- ABA DE HISTÓRICO --- */}
        <TabsContent value="historico">
          <div className="border rounded-md bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Livro</TableHead>
                  <TableHead>Empréstimo</TableHead>
                  <TableHead>Devolução</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historico.map((emp: any) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.livro?.titulo}</TableCell>
                    <TableCell>{format(new Date(emp.dataEmprestimo), 'dd/MM/yyy')}</TableCell>
                    <TableCell>{format(new Date(emp.dataDevolucao), 'dd/MM/yyy')}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">Devolvido</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}