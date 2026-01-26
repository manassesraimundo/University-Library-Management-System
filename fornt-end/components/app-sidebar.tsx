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
import { toast } from "sonner";
import { api } from "@/lib/api";

const items = [
  { title: "Início", url: "/dashboard", icon: Home },
  { title: "Livros", url: "/dashboard/livro", icon: Book },
  { title: "Categorias", url: "/dashboard/categorias", icon: Tag },
  { title: "Autores", url: "/dashboard/autores", icon: Users },
  { title: "Empréstimos", url: "/dashboard/emprestimos", icon: Book },
  { title: "Reservas", url: "/dashboard/reservas", icon: Clock },
  { title: "Funcionarios", url: "/dashboard/funcionarios", icon: Users },
  { title: "Membros", url: "/dashboard/membro", icon: Users },
  { title: "Relatório", url: "/dashboard/relatorio", icon: NotebookIcon },
  { title: "Configurações", url: "#", icon: Settings },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const [modalPerfilAberto, setModalPerfilAberto] = useState(false)

  const { user, loading, setUser } = useAuth();

  useEffect(() => {
    if (loading) return ;

    router.refresh()
  }, [user, loading])

  const handleLogout = async () => {
    const res = await api.post('/auth/logout');

    if (res.data.statusCode === 200) {
      setUser(null);
      toast.success(res.data.message)
      router.replace('/login')
    }
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
          <SidebarGroupLabel className="text-primary font-bold text-lg mb-4">
            BIBLIO-TECH
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                user?.role === 'BIBLIOTECARIO' && (item.title === 'Funcionarios' || item.title === 'Configurações') ? null
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