'use client'

import { createContext, useContext, useEffect, useState } from "react"
import { api } from "@/lib/api"

interface IUserAuth {
  id: number
  role: string
  nome: string
  email: string
}

interface IMembroAuth {
  id: number
  usuario: IUserAuth
  matricula: string
  tipo: string
}

interface IAuthContext {
  user: IUserAuth | null
  membro: IMembroAuth | null
  loading: boolean
  // setUser: () => {}
}

const AuthContext = createContext<IAuthContext | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUserAuth | null>(null)
  const [membro, setMembro] = useState<IMembroAuth | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    async function loadUser() {
      try {
        const res = await api.get('/auth/me')
        const data = res.data

        setMembro(data?.matricula ? data : null)
        setUser(data?.email ? data : null)

      } catch {
        setUser(null)
        setMembro(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, membro, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }

  return context
}
