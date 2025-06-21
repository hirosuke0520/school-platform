import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTemporaryPassword, hashPassword } from '@/lib/password-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role } = body;

    // バリデーション
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { 
        email,
        isDeleted: false 
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      );
    }

    // 仮パスワード生成
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(temporaryPassword);

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role as 'ADMIN' | 'INSTRUCTOR' | 'LEARNER',
        passwordHash: hashedPassword,
        isFirstLogin: true,
      },
    });

    return NextResponse.json({
      message: 'ユーザーが正常に作成されました',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      temporaryPassword,
    });

  } catch (error) {
    console.error('ユーザー作成エラー:', error);
    return NextResponse.json(
      { error: 'ユーザーの作成に失敗しました' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ users });

  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    return NextResponse.json(
      { error: 'ユーザーの取得に失敗しました' },
      { status: 500 }
    );
  }
}