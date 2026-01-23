import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Componente para Login de Membro
export const MemberFields = ({ matricula, setMatricula }: any) => (
    <div className="grid gap-2">
        <Label htmlFor="matricula">Matrícula</Label>
        <Input
            id="matricula"
            type="text"
            placeholder="20202020"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
        />
    </div>
);