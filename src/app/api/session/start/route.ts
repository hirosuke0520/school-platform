import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // ユーザーの存在確認
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!userExists) {
      console.error("User not found in database:", userId);
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }
    const body = await request.json();
    const { startReport } = body;

    // 既存の進行中セッションがある場合は終了させる
    const existingSession = await prisma.learningSession.findFirst({
      where: {
        userId,
        endedAt: null,
      },
    });

    if (existingSession) {
      await prisma.learningSession.update({
        where: { id: existingSession.id },
        data: { 
          endedAt: new Date(),
          progressReport: '自動終了: 新しいセッション開始のため',
        },
      });
    }

    // レッスンIDの処理は削除

    // 新しい学習セッションを開始
    const newSession = await prisma.learningSession.create({
      data: {
        userId,
        startedAt: new Date(),
        progressReport: startReport || null,
      },
    });

    // レッスン進捗の更新は削除（別途レッスン進捗APIで管理）

    return NextResponse.json({
      success: true,
      sessionId: newSession.id,
      startedAt: newSession.startedAt,
      message: "学習セッションを開始しました",
    });

  } catch (error) {
    console.error("Session start error:", error);
    return NextResponse.json(
      { error: "学習セッションの開始中にエラーが発生しました" },
      { status: 500 }
    );
  }
}