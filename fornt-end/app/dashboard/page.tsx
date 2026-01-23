'use client'

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [totalLivro, setTotalLivro] = useState(0)
  const [totalMembro, setTotalMembro] = useState(0)
  const [emprestimos, setEmprestimos] = useState([])
  const [totalEmprestimosAtivos, setTotalEmprestimosAtivos] = useState(0)
  const [totalEmprestimosAtraso, setTotalEmprestimosAtraso] = useState(0)

  const carregarDados = async () => {
    try {
      const total = await api.get('/livros/cont-livros')
      setTotalLivro(total.data.totalLivros)

      const totalemprestimos = await api.get('/emprestimos/cont-emprestimos')
      setTotalEmprestimosAtivos(totalemprestimos.data.totalEmprestimos)

      const totalMembro = await api.get('/membros?status=true')
      setTotalMembro(totalMembro.data.length)

      const totalAtraso = await api.get('/emprestimos/cont-emprestimos-atraso')
      setTotalEmprestimosAtraso(totalAtraso.data.totalEmprestimos)

      const emprestimos = await api.get('/emprestimos/todos')

      const entreges = emprestimos.data.filter((emp: any) => emp.dataDevolucao !== null)
      setEmprestimos(entreges)
    } catch (error) {
      
    }
  }

  useEffect(() => { carregarDados() }, []);

  return (
    <div className="flex-1 p-6 space-y-6 bg-slate-50/50 min-h-screen">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="text-2xl font-bold tracking-tight">Visão Geral</h1>
        </div>
      </header>

      {/* CARDS DE MÉTRICAS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total de Livros" value={totalLivro} description="+12 novos este mês" />
        <MetricCard title="Empréstimos Ativos" value={totalEmprestimosAtivos} description="85% de retorno no prazo" />
        <MetricCard title="Membros Ativos" value={totalMembro} description="+180 novos membros" />
        <MetricCard title="Pendências" value={totalEmprestimosAtraso} description="Livros em atraso" color="text-red-600" />
      </div>

      {/* ÁREA DE GRÁFICOS E TABELAS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader><CardTitle>Fluxo Mensal</CardTitle></CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
            {/* O Gráfico do shadcn/chart entraria aqui */}
            <span className="text-muted-foreground italic">Espaço para Gráfico de Barras</span>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader><CardTitle>Últimos Empréstimos</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emprestimos.slice(0, 10).map((emp: any, index: number) => (
                <div key={index} className="flex items-center gap-4 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-200" />
                  <div className="flex-1">
                    <p className="font-medium">
                      {emp.membro?.matricula}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {emp.membro?.usuario?.nome}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-green-600">Entregue</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente Interno para os Cards de Métrica
function MetricCard({ title, value, description, color = "text-foreground" }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}