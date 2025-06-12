import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get('role')?.value; // อ่าน role จาก cookie

  // กรณีไม่ login เลย
  if (!role && (pathname.startsWith('/student') || pathname.startsWith('/instructor') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ตรวจสิทธิ์ตาม role
  if (pathname.startsWith('/student') && role !== 'student') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (pathname.startsWith('/instructor') && role !== 'instructor') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

// Matcher บอก Next.js ว่า middleware นี้ทำงานกับ path อะไรบ้าง
export const config = {
  matcher: [
    '/student/:path*',
    '/instructor/:path*',
    '/admin/:path*',
  ],
};
