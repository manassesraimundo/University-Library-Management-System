'use client'

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog";
import {
    CalendarClock,
    Calendar as CalendarIcon,
    Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { SearchableSelect } from "./create-livro-form";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ILivro } from "@/types/interface";
import AlertGlobal from "./alertGlobal";

export function CreateReservaModal({ onSucesso }: { onSucesso: () => void }) {
    const [livros, setLivros] = useState<ILivro[]>([])
    const [libvroSel, setLivroSel] = useState<string>("")
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)
    const [matricula, setMatricula] = useState<string>("")
    const [tituloLivro, setTituloLivro] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)

    const [timeZone, setTimeZone] = useState<string | undefined>(undefined)

    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<boolean>(false);

    const carregarLivros = async () => {
        try {
            const [resEmprestados, resReservados] = await Promise.all([
                api.get(`/livros?titulo=${tituloLivro}&status=EMPRESTADO`),
                api.get(`/livros?titulo=${tituloLivro}&status=RESERVADO`)
            ]);
            const formatados1 = resEmprestados.data.map((l: any) => ({ id: l.id, nome: l.titulo }));
            const formatados2 = resReservados.data.map((l: any) => ({ id: l.id, nome: l.titulo }));
            setLivros([...formatados1, ...formatados2])
        } catch (error) {
            toast.error("")
        }
    }

    useEffect(() => {
        if (isOpen)
            carregarLivros();
    }, [tituloLivro, isOpen])

    useEffect(() => {
        setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    }, [])

    const handleCriar = async () => {
        if (!libvroSel || !matricula) {
            return toast.error("Preencha todos os campos corretamente.");
        }

        setLoading(true)
        try {
            await api.post('/reservas', {
                livroId: libvroSel,
                matricula: matricula
            });
            toast.success("Reserva criada com sucesso!");
            onSucesso();
            setIsOpen(false);

            setMatricula("");
            setLivroSel("");
        } catch (error: any) {
            setError(true)
            setMessage(error.response?.data?.message || "Erro ao criar reserva")
        } finally {
            setLoading(false)
        }
    }

    if (error) {
        return <AlertGlobal
            isOpen={error}
            setIsOpen={() => setError(false)}
            message={message}
            titulo="Error ao Reservar"
        />
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2"><CalendarClock size={18} /> Nova Reserva</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reservar Livro</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Selecionar Livro</Label>
                        <SearchableSelect
                            items={livros}
                            selected={libvroSel}
                            setSelected={setLivroSel}
                            open={open}
                            setOpen={setOpen}
                            placeholder="Pesquisar livro indisponível..."
                            value={tituloLivro}
                            onChangeCapture={() => setTituloLivro}
                        />
                    </div>

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
                            onClick={() => setIsOpen(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCriar}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : "Confirmar Reserva"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}