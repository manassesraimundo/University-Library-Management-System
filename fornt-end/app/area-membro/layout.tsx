'use client';

import { CardVincular } from "@/components/card-vincular";
import { HeaderMembro } from "@/components/user-nav";
import { useAuth } from "@/context/auth-context"
import { IMembro } from "@/types/interface";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AreaMembroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { membro, loading } = useAuth();

  const [dados, setDados] = useState<IMembro | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [vincular, setVincular] = useState<boolean>(true);
  const [intervalo, setIntervalo] = useState<boolean>(false);

  const carregarPainelMembro = async () => {
    try {
      const res = await api.get('/membros/meu-painel')
      setDados(res.data)
    } catch (error) {
      console.log("Erro ao carregar dados do membro")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && !membro) {
      window.location.href = "/login";
    }
    carregarPainelMembro()
  }, [loading, membro]);

  useEffect(() => {
    if (dados && !dados.usuario && vincular) {
      const timer = setTimeout(() => {
        setIntervalo(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [dados, vincular])

  if (isLoading) return <div className="p-10 text-center">Carregando seu acervo...</div>

  if (intervalo && vincular) {
    return (
      <CardVincular
        dados={dados}
        carregarPainelMembro={carregarPainelMembro}
        setVincular={() => setVincular(false)}
      />
    )
  }

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
      <HeaderMembro />
      {children}
    </div>
  )
}