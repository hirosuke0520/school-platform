import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// チャプター詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const chapterId = parseInt(resolvedParams.id);

    if (isNaN(chapterId)) {
      return NextResponse.json(
        { error: '無効なチャプターIDです' },
        { status: 400 }
      );
    }

    const chapter = await prisma.chapter.findFirst({
      where: {
        id: chapterId,
        isDeleted: false
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        lessons: {
          where: {
            isDeleted: false
          },
          orderBy: {
            orderIndex: 'asc'
          }
        }
      }
    });

    if (!chapter) {
      return NextResponse.json(
        { error: 'チャプターが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ chapter });
  } catch (error) {
    console.error('チャプター取得エラー:', error);
    return NextResponse.json(
      { error: 'チャプターの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// チャプター更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const chapterId = parseInt(resolvedParams.id);

    if (isNaN(chapterId)) {
      return NextResponse.json(
        { error: '無効なチャプターIDです' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, courseId, orderIndex } = body;

    // バリデーション
    if (!title) {
      return NextResponse.json(
        { error: 'チャプター名は必須です' },
        { status: 400 }
      );
    }

    if (!courseId) {
      return NextResponse.json(
        { error: 'コースの選択は必須です' },
        { status: 400 }
      );
    }

    // チャプターの存在確認
    const existingChapter = await prisma.chapter.findFirst({
      where: {
        id: chapterId,
        isDeleted: false
      }
    });

    if (!existingChapter) {
      return NextResponse.json(
        { error: 'チャプターが見つかりません' },
        { status: 404 }
      );
    }

    // コースの存在確認
    const course = await prisma.course.findFirst({
      where: {
        id: parseInt(courseId),
        isDeleted: false
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: '指定されたコースが見つかりません' },
        { status: 404 }
      );
    }

    // 同じコース内で同じorderIndexのチャプターが存在するかチェック（自分以外）
    const duplicateChapter = await prisma.chapter.findFirst({
      where: {
        courseId: parseInt(courseId),
        orderIndex: orderIndex,
        isDeleted: false,
        NOT: {
          id: chapterId
        }
      }
    });

    let finalOrderIndex = orderIndex;
    if (duplicateChapter) {
      // 同じコース内での最大のorderIndexを取得して+1
      const maxOrderIndex = await prisma.chapter.findFirst({
        where: {
          courseId: parseInt(courseId),
          isDeleted: false
        },
        orderBy: {
          orderIndex: 'desc'
        }
      });
      finalOrderIndex = (maxOrderIndex?.orderIndex || 0) + 1;
    }

    // チャプター更新
    const updatedChapter = await prisma.chapter.update({
      where: {
        id: chapterId
      },
      data: {
        title,
        description,
        courseId: parseInt(courseId),
        orderIndex: finalOrderIndex
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json({ chapter: updatedChapter });
  } catch (error) {
    console.error('チャプター更新エラー:', error);
    return NextResponse.json(
      { error: 'チャプターの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// チャプター削除（論理削除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const chapterId = parseInt(resolvedParams.id);

    if (isNaN(chapterId)) {
      return NextResponse.json(
        { error: '無効なチャプターIDです' },
        { status: 400 }
      );
    }

    // チャプターの存在確認
    const existingChapter = await prisma.chapter.findFirst({
      where: {
        id: chapterId,
        isDeleted: false
      }
    });

    if (!existingChapter) {
      return NextResponse.json(
        { error: 'チャプターが見つかりません' },
        { status: 404 }
      );
    }

    // チャプターとそのレッスンを論理削除
    await prisma.$transaction([
      // チャプター内のレッスンを論理削除
      prisma.lesson.updateMany({
        where: {
          chapterId: chapterId,
          isDeleted: false
        },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        }
      }),
      // チャプターを論理削除
      prisma.chapter.update({
        where: {
          id: chapterId
        },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        }
      })
    ]);

    return NextResponse.json({ 
      message: 'チャプターが削除されました',
      deletedChapterId: chapterId 
    });
  } catch (error) {
    console.error('チャプター削除エラー:', error);
    return NextResponse.json(
      { error: 'チャプターの削除に失敗しました' },
      { status: 500 }
    );
  }
}