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

    if (isNaN(lessonId)) {
      return NextResponse.json({ error: "無効なレッスンIDです" }, { status: 400 });
    }

    // レッスンが存在するかチェック
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json({ error: "レッスンが見つかりません" }, { status: 404 });
    }

    // 学習セッション管理は別途実装（/api/session/startで管理）

    // 進捗レコードの作成/更新
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    let userProgress;

    if (existingProgress && existingProgress.status === "NOT_STARTED") {
      // 未開始から進行中に変更
      userProgress = await prisma.userProgress.update({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
        data: {
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
      });
    } else if (!existingProgress) {
      // 新しい進捗を作成
      userProgress = await prisma.userProgress.create({
        data: {
          userId,
          lessonId,
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
      });
    } else {
      userProgress = existingProgress;
    }

    return NextResponse.json({
      success: true,
      userProgress,
      message: "レッスンを開始しました",
    });

  } catch (error) {
    console.error("Learning session start error:", error);
    return NextResponse.json(
      { error: "学習セッションの開始中にエラーが発生しました" },
      { status: 500 }
    );
  }
}