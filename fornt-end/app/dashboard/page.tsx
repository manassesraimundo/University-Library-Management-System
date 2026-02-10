'use client'

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { api } from "@/lib/api";
import { Book, Bookmark, HandHelping, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";

export default function DashboardPage() {
  const [totalLivro, setTotalLivro] = useState(0)
  const [totalMembro, setTotalMembro] = useState(0)
  const [emprestimos, setEmprestimos] = useState([])
  const [totalEmprestimosAtivos, setTotalEmprestimosAtivos] = useState(0)
  const [totalEmprestimosAtraso, setTotalEmprestimosAtraso] = useState(0)

  const carregarDados = async () => {
    try {
      const [livros, emps, membros, atrasos, ultimos] = await Promise.all([
        api.get('/livros/cont-livros'),
        api.get('/emprestimos/cont-emprestimos'),
        api.get('/membros?status=true'),
        api.get('/emprestimos/cont-emprestimos-atraso'),
        api.get('/emprestimos/todos/entreges')
      ]);

      setTotalLivro(livros.data.totalLivros);
      setTotalEmprestimosAtivos(emps.data.totalEmprestimos);
      setTotalMembro(membros.data.length);
      setTotalEmprestimosAtraso(atrasos.data.totalEmprestimos);
      setEmprestimos(ultimos.data);
    } catch (error: any) {
      if (error.response?.status === 401) window.location.href = '/login';
      console.error("Erro ao carregar dashboard:", error);
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">
        <MetricCard title="Total de Livros" value={totalLivro} description="Acervo total cadastrado" />
        <MetricCard title="Empréstimos Ativos" value={totalEmprestimosAtivos} description="Livros circulando" />
        <MetricCard title="Membros Ativos" value={totalMembro} description="Membros com acesso" />
        <MetricCard title="Pendências" value={totalEmprestimosAtraso} description="Livros em atraso" color="text-red-600" />
      </div>

      <Label className="font-bold text-xl">Acesso Rápido</Label>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* ÁREA DE ACESSO RÁPIDO (No lugar do gráfico) */}
        <div className="col-span-4 grid grid-cols-2 gap-4">
          <QuickAccessCard
            title="Livros"
            description="Gerenciar acervo"
            href="/dashboard/livro"
            icon={Book}
            color="bg-blue-500"
          />
          <QuickAccessCard
            title="Empréstimos"
            description="Novo empréstimo"
            href="/dashboard/emprestimos"
            icon={HandHelping}
            color="bg-green-500"
          />
          <QuickAccessCard
            title="Reservas"
            description="Ver pedidos"
            href="/dashboard/reservas"
            icon={Bookmark}
            color="bg-purple-500"
          />
          <QuickAccessCard
            title="Membros"
            description="Lista de usuários"
            href="/dashboard/membro"
            icon={Users}
            color="bg-orange-500"
          />
        </div>

        {/* ÚLTIMOS EMPRÉSTIMOS */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Últimos Empréstimos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emprestimos.slice(0, 6).map((emp: any, index: number) => (
                <div key={index} className="flex items-center gap-4 text-sm border-b pb-3 last:border-0 last:pb-0">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                    {emp.membro?.usuario?.nome?.[0]}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium truncate">{emp.membro?.usuario?.nome}</p>
                    <p className="text-xs text-muted-foreground">{emp.membro?.matricula}</p>
                  </div>
                  <BadgeSuccess />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, description, color = "text-foreground" }: any) {
  return (
    <Card className="shadow-sm">
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

function QuickAccessCard({ title, description, href, icon: Icon, color }: any) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 group-active:scale-95">
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors flex items-center gap-2">
              {title}
              <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function BadgeSuccess() {
  return (
    <span className="px-2 py-1 rounded-full bg-green-50 text-[10px] font-bold text-green-600 border border-green-100 uppercase">
      Entregue
    </span>
  )
}