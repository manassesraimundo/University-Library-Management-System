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
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function LoginPage() {
    const router = useRouter();
    const [isMembro, setIsMembro] = useState(false);
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [matricula, setMatricula] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleMode = () => {
        setIsMembro(!isMembro);
        setEmail(''); setSenha(''); setMatricula('');
        setError('');
    };

    const handleLogin = async () => {
        setIsLoading(true);
        setError('');

        try {
            // Define qual endpoint e dados enviar baseado no modo
            const endpoint = isMembro ? '/auth/membro/login' : '/auth/usuario/login';
            const payload = isMembro ? { matricula } : { email, senha };

            const response = await api.post(endpoint, payload);

            toast.success(response.data.message)

            if (response.data.role !== 'MEMBRO')
                router.replace('/dashboard');
            else
                router.replace('/area-membro')
        } catch (err: any) {
            console.log(err)
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
                    <CardHeader className="space-y-1">
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

                        <div className="flex items-center w-full my-2">
                            <div className="flex-1 border-b border-slate-200"></div>
                            <span className="px-2 text-[10px] uppercase text-slate-400 font-bold">ou</span>
                            <div className="flex-1 border-b border-slate-200"></div>
                        </div>

                        <button
                            onClick={toggleMode}
                            className="w-full py-2 text-sm font-medium text-blue-100 bg-blue-500 hover:bg-blue-600 rounded-md border border-blue-200 transition-colors hover:cursor-pointer"
                        >
                            {isMembro ? "Entrar como funcionário" : "Entrar como membro"}
                        </button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
