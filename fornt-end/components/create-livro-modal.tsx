'use client'

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateLivroForm } from "./create-livro-form";
import { api } from "@/lib/api";
import { Input } from "./ui/input";
import { Label } from "recharts";
import { toast } from "sonner";

export function CreateLivroModal({ onLivroCriado, }: { onLivroCriado: () => void }) {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<any>({});

  const carregarImage = async () => {
    if (!file) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('image', file);

      const result = await api.post('/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setScanResult(result.data);
      toast.success("Dados estraido com sucesso.")
    } catch (error) {
      console.error(error);
      alert('Erro ao processar imagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Novo Livro
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-6">
            <div>
              <DialogTitle className="text-xl">Cadastrar Livro</DialogTitle>
              <DialogDescription>
                Preencha os dados ou use a IA para extrair via foto da capa.
              </DialogDescription>
            </div>

            {/* UI DE SCANNER MELHORADA */}
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <div className="flex flex-col gap-1">
                <p className="font-bold font-medium">OCR de Livros</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    id="image"
                    accept="image/*"
                    className="w-[180px] h-8 text-[11px] bg-white"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={carregarImage}
                    disabled={loading || !file}
                    className="h-8 gap-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300"
                  >
                    {loading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    <span className="text-xs">{loading ? 'Lendo...' : 'Extrair IA'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <CreateLivroForm
          closeModal={setOpen}
          onLivroCriado={onLivroCriado}
          scanResult={scanResult}
        />
      </DialogContent>
    </Dialog>
  );
}

