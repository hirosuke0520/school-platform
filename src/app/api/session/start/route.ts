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
    const body = await request.json();
    const { lessonId } = body;

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

    // レッスンIDが指定されている場合、存在確認
    if (lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: parseInt(lessonId) },
      });

      if (!lesson) {
        return NextResponse.json(
          { error: "指定されたレッスンが見つかりません" },
          { status: 404 }
        );
      }
    }

    // 新しい学習セッションを開始
    const newSession = await prisma.learningSession.create({
      data: {
        userId,
        lessonId: lessonId ? parseInt(lessonId) : null,
        startedAt: new Date(),
      },
    });

    // レッスンの進捗状態を「進行中」に更新（レッスンが指定されている場合）
    if (lessonId) {
      await prisma.userProgress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId: parseInt(lessonId),
          },
        },
        update: {
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
        create: {
          userId,
          lessonId: parseInt(lessonId),
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
      });
    }

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