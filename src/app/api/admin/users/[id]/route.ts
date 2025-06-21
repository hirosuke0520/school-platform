import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const body = await request.json();
    const { name, email, role } = body;

    // バリデーション
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // 更新対象のユーザーが存在するかチェック
    const existingUser = await prisma.user.findUnique({
      where: { 
        id: userId,
        isDeleted: false 
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // メールアドレスの重複チェック（自分以外で同じメールアドレスがないか）
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { 
          email,
          isDeleted: false 
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'このメールアドレスは既に使用されています' },
          { status: 400 }
        );
      }
    }

    // ユーザー更新
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        role: role as 'ADMIN' | 'INSTRUCTOR' | 'LEARNER',
        // メールアドレスが変更された場合は認証をリセット
        emailVerified: email !== existingUser.email ? null : existingUser.emailVerified,
      },
    });

    return NextResponse.json({
      message: 'ユーザーが正常に更新されました',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        emailVerified: updatedUser.emailVerified,
      },
    });

  } catch (error) {
    console.error('ユーザー更新エラー:', error);
    return NextResponse.json(
      { error: 'ユーザーの更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // 削除対象のユーザーが存在するかチェック（既に削除されていないかも確認）
    const existingUser = await prisma.user.findUnique({
      where: { 
        id: userId,
        isDeleted: false 
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // ソフト削除（論理削除）を実行
    await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'ユーザーが正常に削除されました',
    });

  } catch (error) {
    console.error('ユーザー削除エラー:', error);
    return NextResponse.json(
      { error: 'ユーザーの削除に失敗しました' },
      { status: 500 }
    );
  }
}