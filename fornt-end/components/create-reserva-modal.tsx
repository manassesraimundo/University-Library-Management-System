import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog";
import { Button } from "./ui/button";
import { CalendarClock } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { SearchableSelect } from "./create-livro-form";
import { api } from "@/lib/api";

export function CreateReservaModal({ onSucesso }: { onSucesso: () => void }) {
    const [livroId, setLivroId] = useState("")
    const [livros, setLivros] = useState([])
    const [libvroSel, setLivroSel] = useState("")

    const [isOpen, setIsOpen] = useState(false)

    const [open, setOpen] = useState("")
    const [matricula, setMatricula] = useState("")
    const [tituloLivro, setTituloLivro] = useState("")
    const [loading, setLoading] = useState(false)

    const carregarLivros = async () => {
        try {
            const [resEmprestados, resReservados] = await Promise.all([
                api.get(`/livros?titulo=${tituloLivro}&status=EMPRESTADO`),
                api.get(`/livros?titulo=${tituloLivro}&status=RESERVADO`)
            ]);

            const formatados1 = resEmprestados.data.map((l: any) => ({
                id: l.id,
                nome: l.titulo
            }));

            const formatados2 = resReservados.data.map((l: any) => ({
                id: l.id,
                nome: l.titulo
            }));

            const todosLivrosIndisponiveis: any = [...formatados1, ...formatados2];

            setLivros(todosLivrosIndisponiveis)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        carregarLivros();
    }, [tituloLivro])

    const handleCriar = async () => {
        setLoading(true)
        try {

        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2"><CalendarClock size={18} /> Nova Reserva</Button>
            </DialogTrigger>
            <DialogContent aria-describedby="">
                <DialogHeader>
                    <DialogTitle>Reservar Livro</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Seleciona Livro</Label>
                        <SearchableSelect
                            items={livros}
                            selected={libvroSel}
                            setSelected={setLivroSel}
                            open={open}
                            setOpen={setOpen}
                            placeholder="Selecionar livro..."
                            value={tituloLivro}
                            onChangeCapture={setTituloLivro}
                        />
                    </div>

                    <CalendarClock accentHeight={45} />

                    <div className="grid gap-2">
                        <Label>Matrícula do Membro</Label>
                        <Input
                            value={matricula}
                            onChange={(e) => setMatricula(e.target.value)}
                            placeholder="Ex: 2023..."
                        />
                    </div>

                    <div className="flex justify-end items-center gap-3 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(!isOpen)}
                            disabled={loading}
                            // className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCriar}
                            disabled={loading}
                            className=" bg-green-600 hover:bg-green-700"
                        >
                            {loading ? "Processando..." : "Confirmar Reserva"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}