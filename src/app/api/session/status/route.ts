import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const userId = session.user.id;

    // 進行中の学習セッションを検索
    const currentSession = await prisma.learningSession.findFirst({
      where: {
        userId,
        endedAt: null, // 終了していないセッション
      },
      include: {
        lesson: {
          include: {
            chapter: {
              include: {
                course: true,
              },
            },
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    if (currentSession) {
      // セッションが24時間を超えているかチェック
      const now = new Date();
      const startTime = new Date(currentSession.startedAt);
      const elapsed = now.getTime() - startTime.getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      const status = elapsed >= twentyFourHours ? 'PENDING_END' : 'ACTIVE';

      return NextResponse.json({
        status,
        currentSession: {
          id: currentSession.id,
          startedAt: currentSession.startedAt,
          lessonId: currentSession.lessonId,
          elapsed,
          lesson: currentSession.lesson,
        },
      });
    }

    // アクティブなセッションがない場合
    return NextResponse.json({
      status: 'NOT_STARTED',
      currentSession: null,
    });

  } catch (error) {
    console.error("Session status check error:", error);
    return NextResponse.json(
      { error: "セッション状態の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}