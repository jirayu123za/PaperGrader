import { NextResponse, NextRequest } from 'next/server'


const TOKEN_COOKIE = 'user_token'



const INSTRUCTOR_HOME = '/INSCourseOverview'
const STUDENT_HOME    = '/student/overview'


const PUBLIC_PATHS = new Set<string>([
  '/',
  '/signin',
  '/signup',
  '/login',
  '/auth/callback',
  '/google/callback',
  '/cmu/callback',
  '/cmuEntraIDCallback',
])


const INSTRUCTOR_PREFIX = '/instructor'
const STUDENT_PREFIX    = '/student'


function base64UrlDecode(input: string) {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 === 2 ? '==' : b64.length % 4 === 3 ? '=' : ''
  const str = atob(b64 + pad)
  try {
    return decodeURIComponent(
      Array.prototype.map
        .call(str, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
  } catch {
    return str
  }
}
function decodeJwt<T = any>(token: string | undefined): T | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length < 2) return null
  try { return JSON.parse(base64UrlDecode(parts[1])) as T } catch { return null }
}

type Role = 'instructor' | 'student' | 'unknown'
function roleFromGroupId(groupId: string | number | null | undefined): Role {
  if (groupId === '1' || groupId === 1) return 'instructor'
  if (groupId === '2' || groupId === 2) return 'student'
  return 'unknown'
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl


  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/fonts') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.txt') ||
    pathname.endsWith('.map') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.pdf') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.ttf') ||
    pathname.endsWith('.otf') ||
    pathname.endsWith('.wasm')
  ) {
    return NextResponse.next()
  }


  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next()
  }


  const token = req.cookies.get(TOKEN_COOKIE)?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/signin'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }


  const claims = decodeJwt(token)
  const groupId: string | number | null =
    (claims as any)?.group_id ?? (claims as any)?.gid ?? null

  const role: Role = roleFromGroupId(groupId)
  if (role === 'unknown') {
    const url = req.nextUrl.clone()
    url.pathname = '/signin'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

 
  const isInstructorArea = pathname.startsWith(INSTRUCTOR_PREFIX)
  const isStudentArea    = pathname.startsWith(STUDENT_PREFIX)

  if (isInstructorArea && role !== 'instructor') {
    const url = req.nextUrl.clone()
    url.pathname = STUDENT_HOME
    return NextResponse.redirect(url)
  }

  if (isStudentArea && role !== 'student') {
    const url = req.nextUrl.clone()
    url.pathname = INSTRUCTOR_HOME
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}


export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets|fonts|.*\\.(?:css|js|png|jpg|jpeg|svg|gif|webp|ico|txt|map|pdf|woff|woff2|ttf|otf|wasm)).*)',
  ],
}
