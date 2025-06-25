import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const resolvedParams = await params;
    const lessonId = parseInt(resolvedParams.lessonId);
    const userId = session.user.id;
    
    // リクエストボディから進捗報告を取得
    const body = await request.json();
    const progressReport = body.progressReport;

    if (isNaN(lessonId)) {
      return NextResponse.json({ error: "無効なレッスンIDです" }, { status: 400 });
    }

    // レッスンが存在するかチェック
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "レッスンが見つかりません" }, { status: 404 });
    }

    // 既存の進捗をチェック
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    let userProgress;

    if (existingProgress) {
      // 既存の進捗を更新
      userProgress = await prisma.userProgress.update({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
    } else {
      // 新しい進捗を作成（開始時刻も設定）
      userProgress = await prisma.userProgress.create({
        data: {
          userId,
          lessonId,
          status: "COMPLETED",
          startedAt: new Date(),
          completedAt: new Date(),
        },
      });
    }

    // 学習セッション管理は別途実装（/api/session/endで管理）
    // 進捗報告はprogressReportとして受け取るが、学習セッションとは別々に管理

    return NextResponse.json({
      success: true,
      userProgress,
      message: "レッスンを完了しました！",
    });

  } catch (error) {
    console.error("Lesson completion error:", error);
    return NextResponse.json(
      { error: "レッスンの完了処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}