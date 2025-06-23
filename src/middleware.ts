import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req: NextRequest & { auth: { user?: { role: string } } | null }) => {
  const { auth } = req
  const { pathname } = req.nextUrl

  // 認証が不要なパス
  const publicPaths = ['/login', '/api/auth']
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 認証されていない場合はログインページへ
  if (!auth?.user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 管理画面へのアクセス制御
  if (pathname.startsWith('/admin')) {
    if (auth.user.role === 'LEARNER') {
      const redirectUrl = new URL('/', req.url)
      redirectUrl.searchParams.set('error', 'access_denied')
      redirectUrl.searchParams.set('message', '管理画面へのアクセス権限がありません')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // ユーザー管理へのアクセス制御（管理者のみ）
  if (pathname.startsWith('/admin/users')) {
    if (auth.user.role !== 'ADMIN') {
      const redirectUrl = new URL('/admin', req.url)
      redirectUrl.searchParams.set('error', 'access_denied')
      redirectUrl.searchParams.set('message', 'ユーザー管理へのアクセス権限がありません')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}

export const runtime = 'nodejs'