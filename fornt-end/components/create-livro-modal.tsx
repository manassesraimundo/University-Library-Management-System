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
import { Loader2, Plus, Sparkles, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateLivroForm } from "./create-livro-form";
import { api } from "@/lib/api";
import { Input } from "./ui/input";
import { toast } from "sonner";

export function CreateLivroModal({ onLivroCriado }: { onLivroCriado: () => void }) {
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setScanResult(result.data);
      toast.success("Dados extraídos com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error('Erro ao processar imagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Novo Livro
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[850px] max-h-[95vh] overflow-y-auto p-0 gap-0">
        {/* CABEÇALHO COM GRADIENTE LEVE */}
        <div className="p-6 border-b bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-6">
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900">Cadastrar Livro</DialogTitle>
              <DialogDescription className="text-slate-500">
                Adicione um novo item manualmente ou agilize o processo usando nossa IA.
              </DialogDescription>
            </div>

            {/* BOX DO SCANNER - ESTILIZADO COMO FERRAMENTA */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 min-w-[320px]">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Scanner Inteligente (OCR)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                   <Input
                    type="file"
                    id="image"
                    accept="image/*"
                    className="h-9 text-[11px] pr-8 cursor-pointer file:border-0 file:bg-transparent file:text-xs file:font-medium"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <ImageIcon className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                <Button
                  size="sm"
                  onClick={carregarImage}
                  disabled={loading || !file}
                  className="h-9 gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-all"
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  <span className="text-xs font-semibold">{loading ? 'Lendo...' : 'Extrair'}</span>
                </Button>
              </div>
              {file && !loading && (
                <p className="text-[10px] text-green-600 font-medium animate-pulse">
                   ✓ Imagem selecionada: {file.name.substring(0, 20)}...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ÁREA DO FORMULÁRIO */}
        <div className="p-6">
          <CreateLivroForm
            closeModal={setOpen}
            onLivroCriado={onLivroCriado}
            scanResult={scanResult}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}