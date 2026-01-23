import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose';

export async function proxy(request: NextRequest) {
  const tokenObj = request.cookies.get('access_token');
  const token = tokenObj?.value;
  const { pathname } = request.nextUrl;

  if (!token) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/area-membro')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });

    const userRole = payload.role;

    if (userRole === 'MEMBRO' && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/area-membro', request.url));
    }

    if ((userRole === 'ADMIN' || userRole === 'BIBLIOTECARIO') && pathname.startsWith('/area-membro')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/login')) {
      if (userRole === 'MEMBRO') {
        return NextResponse.redirect(new URL('/area-membro', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

  } catch (error) {
    console.error("Erro na verificação do JWT:", error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('access_token');
    return response;
  }

  return NextResponse.next();
}

// Configuração para o middleware rodar apenas nestas rotas (performance)
export const config = {
  matcher: ['/dashboard/:path*', '/area-membro/:path*', '/login'],
};