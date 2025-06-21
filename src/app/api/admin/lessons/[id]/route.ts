import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 特定レッスンの取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = parseInt(params.id);

    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: '無効なレッスンIDです' },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        isDeleted: false
      },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'レッスンが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error('レッスン取得エラー:', error);
    return NextResponse.json(
      { error: 'レッスンの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// レッスンの更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = parseInt(params.id);

    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: '無効なレッスンIDです' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, content, chapterId, estimatedMinutes, orderIndex, isPublished } = body;

    // バリデーション
    if (!title || !content || !chapterId) {
      return NextResponse.json(
        { error: 'レッスン名、内容、チャプターは必須です' },
        { status: 400 }
      );
    }

    // レッスンが存在するかチェック
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        isDeleted: false
      }
    });

    if (!existingLesson) {
      return NextResponse.json(
        { error: 'レッスンが見つかりません' },
        { status: 404 }
      );
    }

    // チャプターが存在するかチェック
    const chapter = await prisma.chapter.findFirst({
      where: {
        id: parseInt(chapterId),
        isDeleted: false
      }
    });

    if (!chapter) {
      return NextResponse.json(
        { error: '指定されたチャプターが存在しません' },
        { status: 400 }
      );
    }

    // orderIndexが変更される場合、競合チェック
    let finalOrderIndex = orderIndex;
    if (orderIndex !== existingLesson.orderIndex || parseInt(chapterId) !== existingLesson.chapterId) {
      const conflictingLesson = await prisma.lesson.findFirst({
        where: {
          chapterId: parseInt(chapterId),
          orderIndex: orderIndex,
          isDeleted: false,
          id: { not: lessonId } // 自分自身は除外
        }
      });

      if (conflictingLesson) {
        // 該当チャプター内で最大のorderIndexを取得して+1
        const maxOrderIndex = await prisma.lesson.findFirst({
          where: {
            chapterId: parseInt(chapterId),
            isDeleted: false
          },
          orderBy: {
            orderIndex: 'desc'
          }
        });
        finalOrderIndex = (maxOrderIndex?.orderIndex || 0) + 1;
      }
    }

    // レッスンを更新
    const updatedLesson = await prisma.lesson.update({
      where: {
        id: lessonId
      },
      data: {
        title,
        content,
        chapterId: parseInt(chapterId),
        estimatedMinutes: estimatedMinutes || null,
        orderIndex: finalOrderIndex,
        isPublished: isPublished !== undefined ? isPublished : existingLesson.isPublished
      },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ lesson: updatedLesson });
  } catch (error) {
    console.error('レッスン更新エラー:', error);
    return NextResponse.json(
      { error: 'レッスンの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// レッスンの削除（論理削除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = parseInt(params.id);

    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: '無効なレッスンIDです' },
        { status: 400 }
      );
    }

    // レッスンが存在するかチェック
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        isDeleted: false
      }
    });

    if (!existingLesson) {
      return NextResponse.json(
        { error: 'レッスンが見つかりません' },
        { status: 404 }
      );
    }

    // 論理削除
    await prisma.lesson.update({
      where: {
        id: lessonId
      },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    return NextResponse.json({ message: 'レッスンを削除しました' });
  } catch (error) {
    console.error('レッスン削除エラー:', error);
    return NextResponse.json(
      { error: 'レッスンの削除に失敗しました' },
      { status: 500 }
    );
  }
}