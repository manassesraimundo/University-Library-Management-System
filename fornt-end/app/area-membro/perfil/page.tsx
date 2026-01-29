'use client'

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  IdCard,
  Save,
  Trophy,
  Calendar
} from "lucide-react";
import { useRouter } from "next/navigation";
import { IMembro } from "@/types/interface";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function PerfilMembroPage() {
  const router = useRouter();

  const [membro, setMembro] = useState<IMembro | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nome, setNome] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const getMembro = async () => {
    try {
      const response = await api.get('/membros/perfil');
      setMembro(response.data);
      setEmail(response.data.usuario?.email || "");
      setNome(response.data.usuario?.nome || "");
    } catch (error) {
      console.error('Erro ao buscar dados do membro:', error);
    }
  }

  const handleUpdatePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (membro?.usuario) {
        console.log(membro.usuario);
        await api.put('/membros/perfil/atualizar', { nome })
      } else {
        await api.post(`/membros/vincular-usuario`, { nome, email })
      }
      router.refresh();
      toast.success("Perfil atualizado com sucesso!")
    } catch (error) {
      toast.error("Erro ao atualizar perfil.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getMembro()
  }, []);

  const getNivelLeitor = (totalLido: number) => {
    if (totalLido > 20) return { nome: "Mestre da Leitura", cor: "text-purple-500" };
    if (totalLido > 10) return { nome: "Leitor Assíduo", cor: "text-amber-500" };
    if (totalLido > 0) return { nome: "Leitor Iniciante", cor: "text-blue-500" };
    return { nome: "Explorador", cor: "text-slate-500" };
  };

  // No seu JSX:
  const nivel = getNivelLeitor(membro?.historico?.length || 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações e veja seu desempenho como leitor.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Coluna Lateral: Cartão de Identidade */}
        <div className="space-y-6">
          <Card className="text-center overflow-hidden border-none shadow-lg">
            <div className="h-24 bg-primary" />
            <CardContent className="relative pt-0 -mt-12">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                  <AvatarFallback className="text-2xl bg-slate-100">{membro?.usuario?.nome.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <h2 className="mt-4 text-xl font-bold">{membro?.usuario?.nome}</h2>
              <p className="text-sm text-muted-foreground">{membro?.usuario?.email}</p>

              <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{membro?.historico?.length}</p>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Livros Lidos</p>
                </div>
                <div className="text-center border-l">
                  <p className="text-2xl font-bold text-primary">{membro?.reservas.length}</p>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Reservas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badge de Conquista */}
          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Trophy size={28} />
              </div>
              <div>
                <p className="text-xs font-medium opacity-80">Nível do Leitor</p>
                <p className={`font-bold ${nivel.cor}`}>{nivel.nome}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Principal: Formulário e Dados Acadêmicos */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
              <CardDescription>Atualize seus dados básicos de acesso.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePerfil} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-muted-foreground" size={16} />
                      <Input
                        id="nome"
                        className="pl-10"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-muted-foreground" size={16} />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        disabled
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" className="gap-2" disabled={isLoading}>
                    {
                      isLoading ? "Salvando..." : <>
                        <Save size={16} /> {membro?.usuario ? "Salvar Alterações" : "Vincular Conta"}
                      </>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vínculo com a Biblioteca</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border">
                <IdCard className="text-primary" size={24} />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Matrícula</p>
                  <p className="font-mono font-bold">{membro?.matricula || "20240001"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border">
                <Calendar className="text-primary" size={24} />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Membro desde</p>
                  {
                    membro?.criadoEm ? (
                      <p className="font-bold">{format(new Date(membro.criadoEm), 'dd/MM/yyyy')}</p>
                    ) : (
                      <p className="font-bold">--/--/----</p>
                    )
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}