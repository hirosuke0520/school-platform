import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { sessionId, endTime, progressReport } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "セッションIDが必要です" },
        { status: 400 }
      );
    }

    if (!progressReport || progressReport.trim().length === 0) {
      return NextResponse.json(
        { error: "進捗報告は必須です" },
        { status: 400 }
      );
    }

    // 進捗報告の最小文字数チェック
    if (progressReport.trim().length < 20) {
      return NextResponse.json(
        { error: "進捗報告は20文字以上で入力してください" },
        { status: 400 }
      );
    }

    // セッションの存在確認と所有者チェック
    const learningSession = await prisma.learningSession.findUnique({
      where: { id: sessionId },
      include: {
        lesson: true,
      },
    });

    if (!learningSession) {
      return NextResponse.json(
        { error: "セッションが見つかりません" },
        { status: 404 }
      );
    }

    if (learningSession.userId !== userId) {
      return NextResponse.json(
        { error: "セッションへのアクセス権限がありません" },
        { status: 403 }
      );
    }

    if (learningSession.endedAt) {
      return NextResponse.json(
        { error: "このセッションは既に終了しています" },
        { status: 400 }
      );
    }

    // 終了時刻の検証
    const endDateTime = endTime ? new Date(endTime) : new Date();
    const startDateTime = new Date(learningSession.startedAt);

    if (endDateTime < startDateTime) {
      return NextResponse.json(
        { error: "終了時刻は開始時刻より後である必要があります" },
        { status: 400 }
      );
    }

    // 学習セッションを終了
    const updatedSession = await prisma.learningSession.update({
      where: { id: sessionId },
      data: {
        endedAt: endDateTime,
        progressReport: progressReport.trim(),
      },
    });

    // レッスンがある場合、そのレッスンを完了状態にする
    if (learningSession.lessonId) {
      await prisma.userProgress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId: learningSession.lessonId,
          },
        },
        update: {
          status: "COMPLETED",
          completedAt: endDateTime,
        },
        create: {
          userId,
          lessonId: learningSession.lessonId,
          status: "COMPLETED",
          startedAt: startDateTime,
          completedAt: endDateTime,
        },
      });
    }

    // 学習時間を計算
    const learningDuration = endDateTime.getTime() - startDateTime.getTime();
    const hours = Math.floor(learningDuration / (1000 * 60 * 60));
    const minutes = Math.floor((learningDuration % (1000 * 60 * 60)) / (1000 * 60));

    return NextResponse.json({
      success: true,
      session: updatedSession,
      learningDuration: {
        milliseconds: learningDuration,
        formatted: hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`,
      },
      message: "学習セッションを終了しました",
    });

  } catch (error) {
    console.error("Session end error:", error);
    return NextResponse.json(
      { error: "学習セッションの終了中にエラーが発生しました" },
      { status: 500 }
    );
  }
}