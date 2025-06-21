import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // ロールに基づいてリダイレクト先を決定
    const redirectUrl = session.user.role === 'LEARNER' 
      ? new URL('/', request.url)
      : new URL('/admin', request.url);
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}