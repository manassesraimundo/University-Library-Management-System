'use client'

import { AdminFields } from "@/components/admin-fields"
import { MemberFields } from "@/components/member-fields"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { api } from "@/lib/api"
import { Role } from "@/types/enums"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [matricula, setMatricula] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [isMembro, setIsMembro] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { user, loading, setUser, setMembro } = useAuth();

  const toggleMode = () => {
    setIsMembro(!isMembro);
    setEmail(''); setSenha(''); setMatricula('');
    setError('');
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isMembro ? '/auth/membro/login' : '/auth/usuario/login';
      const payload = isMembro ? { matricula } : { email, senha };

      const response = await api.post(endpoint, payload);

      toast.success(response.data.message)

      const res = await api.get('/auth/me')
      const data = res.data;

      if (data?.matricula) {
        setUser(null);
        setMembro(data);
      }
      else {
        setMembro(null)
        setUser(data);
      }

      if (response.data.role !== Role.MEMBRO)
        router.replace('/dashboard');
      else
        router.replace('/area-membro')
    } catch (err: any) {
      const message = err.response?.data?.message || "Erro ao realizar login. Tente novamente.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50/50">
      <div className="w-full max-w-md p-4">
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 flex flex-1 flex-col items-center">
            <div className="text-primary font-bold text-lg flex flex-col items-center justify-center">
              <div className="relative group transition-transform duration-300 hover:scale-105">
                {/* Círculo de fundo suave para destacar o logo */}
                <div className="absolute -inset-2 bg-primary/5 rounded-full blur-sm group-hover:bg-primary/10 transition-colors" />
                <Image
                  alt="logo"
                  src="/logo.png"
                  width={100} // Ajustado para um tamanho de ícone/logo equilibrado
                  height={100}
                  className="relative object-contain"
                />
              </div>
              <div className="flex flex-col items-center">
                <h2 className="text-primary font-black text-sm tracking-tighter leading-none text-end">
                  BIBLIO<span className="text-slate-400 font-light">TECH</span>
                </h2>
                <div className="h-[1px] w-8 bg-primary/20 rounded-full mt-1" />
              </div>
            </div>

            <CardTitle className="text-2xl font-bold text-center">
              {isMembro ? "Área do Membro" : "Portal Administrativo"}
            </CardTitle>
            <CardDescription className="text-center">
              {isMembro ? "Use sua matrícula para entrar." : "Entre com suas credenciais de funcionário."}
            </CardDescription>

            {
              error ? (
                <span className="text-red-600 text-sm">{error}</span>
              ) : (null)
            }
          </CardHeader>

          <CardContent className="grid gap-4">
            {isMembro ? (
              <MemberFields matricula={matricula} setMatricula={setMatricula} />
            ) : (
              <AdminFields email={email} setEmail={setEmail} senha={senha} setSenha={setSenha} />
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button onClick={handleLogin} className="w-full hover:cursor-pointer">Acessar Sistema</Button>

            <div className="flex items-center w-full">
              <div className="flex-1 border-b border-slate-200"></div>
              <span className="px-2 text-[10px] uppercase text-slate-400 font-bold">ou</span>
              <div className="flex-1 border-b border-slate-200"></div>
            </div>

            <Button
              onClick={toggleMode}
              variant={'link'}
            >
              {isMembro ? "Entrar como funcionário" : "Entrar como membro"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
