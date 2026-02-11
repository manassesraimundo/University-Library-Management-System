'use client'

import {
  Home,
  Book,
  Users,
  Settings,
  LogOut,
  Tag,
  Clock,
  NotebookIcon,
  Bookmark,
  AlertTriangle,
  DollarSign
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { PerfilModal } from "./perfil-modal";
import { Role } from "@/types/enums";
import { toast } from "sonner";
import Image from "next/image";

const items = [
  { title: "Início", url: "/dashboard", icon: Home },
  { title: "Livros", url: "/dashboard/livro", icon: Book },
  { title: "Categorias", url: "/dashboard/categorias", icon: Tag },
  { title: "Autores", url: "/dashboard/autores", icon: Users },
  { title: "Empréstimos", url: "/dashboard/emprestimos", icon: Book },
  { title: "Reservas", url: "/dashboard/reservas", icon: Bookmark },
  { title: "Funcionarios", url: "/dashboard/funcionarios", icon: Users },
  { title: "Membros", url: "/dashboard/membro", icon: Users },
  { title: "Multas", url: "/dashboard/multas", icon: DollarSign },
  { title: "Relatório", url: "/dashboard/relatorio", icon: NotebookIcon },
  { title: "Configurações", url: "#", icon: Settings },
]

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [modalPerfilAberto, setModalPerfilAberto] = useState<boolean>(false);

  const { user, loading, setUser, logout } = useAuth();

  useEffect(() => {
    if (loading) return;

    router.refresh();
  }, [user, loading]);

  const handleLogout = async () => {
    logout();
    toast.success("Logout com sucesso.")
    router.replace('/login');
  }

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "U";
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary w-full font-bold text-lg flex flex-col items-start justify-center pt-10 pb-14">
            <Link href={'/dashboard'}>
              <div className="relative group transition-transform duration-300 hover:scale-105">
                {/* Círculo de fundo suave para destacar o logo */}
                <div className="absolute -inset-2 bg-primary/5 rounded-full blur-sm group-hover:bg-primary/10 transition-colors" />

                <Image
                  alt="logo"
                  src="/logo.png"
                  width={120} // Ajustado para um tamanho de ícone/logo equilibrado
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
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                user?.role === Role.BIBLIOTECARIO && (item.title === 'Funcionarios' || item.title === 'Configurações') ? null
                  : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        variant={pathname === item.url ? 'marcado' : 'default'}
                      >
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* RODAPÉ DA SIDEBAR */}
      <SidebarFooter className="border-t p-2 pb-7">
        {/* SEÇÃO DO USUÁRIO */}
        <div
          className="flex items-center gap-3 px-2 mb-2 cursor-pointer hover:bg-[#f1f5f9]"
          onClick={() => setModalPerfilAberto(true)}
        >
          <Avatar className="h-9 w-9 border">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {loading ? "..." : getInitials(user?.nome || '')}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate leading-none">
              {loading ? "Carregando..." : user?.nome}
            </span>
            <span className="text-[11px] text-muted-foreground truncate capitalize">
              {user?.role?.toLowerCase() || "Usuário"}
            </span>
          </div>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 hover:cursor-pointer transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Encerrar Sessão</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* O Modal */}
      <PerfilModal
        isOpen={modalPerfilAberto}
        onClose={() => setModalPerfilAberto(false)}
      />
    </Sidebar>
  )
}