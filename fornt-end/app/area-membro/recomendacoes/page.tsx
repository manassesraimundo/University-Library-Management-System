'use client'

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function RecomendacoesPage() {
  const [textoBruto, setTextoBruto] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const carregarRecomendacoes = async () => {
    try {
      const res = await api.get('/recomendacao');
      setTextoBruto(res.data);
      toast.success("");
    } catch (error: any) {
      toast.error("Não conseguimos carregar suas sugestões agora.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregarRecomendacoes() }, [])

  // Função para limpar e separar o texto (Lógica simples de parser)
  const processarRecomendacoes = () => {
    if (!textoBruto) return { intro: "", livros: [] };

    // Divide o texto onde encontrar "1." ou "2." etc.
    const partes = textoBruto.split(/\d\./);
    const intro = partes[0].trim();
    const livros = partes.slice(1).map(item => {
      const [titulo, ...descricao] = item.split(":");
      return {
        titulo: titulo.replace(/\*\*/g, "").trim(),
        descricao: descricao.join(":").trim()
      };
    });

    return { intro, livros };
  };

  const { intro, livros } = processarRecomendacoes();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-pulse" />
        </div>
        <p className="text-muted-foreground font-medium">Analisando seu perfil literário...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Banner Principal */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-primary hover:bg-primary text-white border-none px-3 py-1">
              SISTEMA IA
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Descobertas <span className="text-primary text-yellow-500">Sob Medida</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            {intro || "Analisamos seu histórico para sugerir sua próxima grande leitura."}
          </p>
        </div>
        {/* Decoração abstrata de fundo */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="text-primary" />
          Sugestões Selecionadas
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {livros.map((livro, index) => (
          <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-none bg-white shadow-md overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                </div>
                <Badge variant="secondary">Rank #{index + 1}</Badge>
              </div>
              <h3 className="text-xl font-bold mt-4 group-hover:text-primary transition-colors">
                {livro.titulo}
              </h3>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {livro.descricao}
              </p>
            </CardContent>
            <CardFooter className="pt-4 border-t bg-slate-50/50 flex gap-2">
              <Button className="w-full gap-2" disabled>
                Ver na Biblioteca
                <ArrowRight size={16} />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}