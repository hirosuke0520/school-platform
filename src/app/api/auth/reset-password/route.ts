import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'パスワードが必要です' },
        { status: 400 }
      );
    }

    // パスワード強度チェック
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'パスワードは8文字以上で入力してください' },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: 'パスワードは大文字、小文字、数字を含む必要があります' },
        { status: 400 }
      );
    }

    // パスワードをハッシュ化
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ユーザー情報を更新
    await prisma.user.update({
      where: {
        id: session.user.id,
        isDeleted: false
      },
      data: {
        passwordHash: hashedPassword,
        isFirstLogin: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'パスワードが正常に更新されました' 
    });

  } catch (error) {
    console.error('パスワードリセットエラー:', error);
    return NextResponse.json(
      { error: 'パスワードの更新に失敗しました' },
      { status: 500 }
    );
  }
}