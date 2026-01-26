'use client'

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, BookOpen, ChevronRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function RecomendacoesPage() {
  const [recomendacoes, setRecomendacoes] = useState([])
  const [loading, setLoading] = useState(true)

  const carregarRecomendacoes = async () => {
    try {
      const res = await api.get('/recomendacao')
      setRecomendacoes(res.data)
    } catch (error: any) {
      toast.error(error.response.data.message ||  "Não conseguimos carregar suas sugestões agora.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregarRecomendacoes() }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Analisando seu perfil de leitura...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Banner de Boas-vindas */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 rounded-2xl border border-primary/10">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="text-primary h-5 w-5" />
          <span className="text-sm font-bold text-primary uppercase tracking-wider">Para Você</span>
        </div>
        <h1 className="text-3xl font-bold">Baseado nas suas leituras</h1>
        <p className="text-muted-foreground mt-2">
          Cruzamos os dados do seu histórico para encontrar títulos que você vai adorar.
        </p>
      </div>

      {recomendacoes.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-muted-foreground">
            Ainda não temos dados suficientes. Comece a ler para receber indicações!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recomendacoes.map((livro: any) => (
            <Card key={livro.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all">
              <div className="aspect-[3/4] relative bg-slate-100">
                {/* Overlay de Ação Rápida */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-3 z-20">
                   <Button size="sm" className="w-full gap-2">
                     <BookOpen size={14} /> Ver detalhes
                   </Button>
                   <Button size="sm" variant="secondary" className="w-full">
                     Reservar Agora
                   </Button>
                </div>

                {/* Badge de Categoria Recomendada */}
                <Badge className="absolute top-3 left-3 z-10 bg-white/90 text-black hover:bg-white">
                  {livro.categoria?.nome || "Sugestão"}
                </Badge>

                {/* Capa do Livro (Placeholder) */}
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <BookOpen className="h-12 w-12 text-slate-300 mb-4" />
                  <span className="font-bold text-sm leading-tight line-clamp-3">{livro.titulo}</span>
                  <span className="text-xs text-muted-foreground mt-2">{livro.autor}</span>
                </div>
              </div>
              
              <CardContent className="p-4 bg-white">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-bold uppercase text-primary tracking-tighter">Match de 98%</span>
                   <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}