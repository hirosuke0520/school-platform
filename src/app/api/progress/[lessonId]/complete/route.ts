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
      // 新しい進捗を作成
      userProgress = await prisma.userProgress.create({
        data: {
          userId,
          lessonId,
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
    }

    // 学習セッションも終了させる（進行中のセッションがある場合）
    const ongoingSession = await prisma.learningSession.findFirst({
      where: {
        userId,
        lessonId,
        endedAt: null,
      },
    });

    if (ongoingSession) {
      await prisma.learningSession.update({
        where: { id: ongoingSession.id },
        data: { 
          endedAt: new Date(),
          progressReport: progressReport,
        },
      });
    }

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