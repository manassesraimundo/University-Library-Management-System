import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

// Componente para Login de Admin/Bibliotecário
interface IAdminFieldsProps {
  email: string;
  setEmail: (e: string) => void;
  senha: string;
  setSenha: (e: string) => void;
}

export const AdminFields = ({ email, setEmail, senha, setSenha }: IAdminFieldsProps) => (
  <>
    <div className="grid gap-2">
      <Label htmlFor="email">E-mail</Label>
      <Input
        id="email"
        type="email"
        placeholder="nome@exemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="password">Senha</Label>
        {/* <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Esqueceu a senha?
                </Link> */}
      </div>
      <Input
        id="password"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
    </div>
  </>
);