import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// コース詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: '無効なコースIDです' },
        { status: 400 }
      );
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        isDeleted: false
      },
      include: {
        chapters: {
          where: {
            isDeleted: false
          },
          include: {
            lessons: {
              where: {
                isDeleted: false
              },
              orderBy: {
                orderIndex: 'asc'
              }
            }
          },
          orderBy: {
            orderIndex: 'asc'
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'コースが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error('コース取得エラー:', error);
    return NextResponse.json(
      { error: 'コースの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// コース更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: '無効なコースIDです' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, orderIndex } = body;

    // バリデーション
    if (!title) {
      return NextResponse.json(
        { error: 'コース名は必須です' },
        { status: 400 }
      );
    }

    // コースの存在確認
    const existingCourse = await prisma.course.findFirst({
      where: {
        id: courseId,
        isDeleted: false
      }
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'コースが見つかりません' },
        { status: 404 }
      );
    }

    // 同じorderIndexのコースが存在するかチェック（自分以外）
    const duplicateCourse = await prisma.course.findFirst({
      where: {
        orderIndex: orderIndex,
        isDeleted: false,
        NOT: {
          id: courseId
        }
      }
    });

    let finalOrderIndex = orderIndex;
    if (duplicateCourse) {
      // 最大のorderIndexを取得して+1
      const maxOrderIndex = await prisma.course.findFirst({
        where: {
          isDeleted: false
        },
        orderBy: {
          orderIndex: 'desc'
        }
      });
      finalOrderIndex = (maxOrderIndex?.orderIndex || 0) + 1;
    }

    // コース更新
    const updatedCourse = await prisma.course.update({
      where: {
        id: courseId
      },
      data: {
        title,
        description,
        orderIndex: finalOrderIndex
      }
    });

    return NextResponse.json({ course: updatedCourse });
  } catch (error) {
    console.error('コース更新エラー:', error);
    return NextResponse.json(
      { error: 'コースの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// コース削除（論理削除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: '無効なコースIDです' },
        { status: 400 }
      );
    }

    // コースの存在確認
    const existingCourse = await prisma.course.findFirst({
      where: {
        id: courseId,
        isDeleted: false
      }
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'コースが見つかりません' },
        { status: 404 }
      );
    }

    // コースとその配下のチャプター・レッスンを論理削除
    await prisma.$transaction([
      // コース内のレッスンを論理削除
      prisma.lesson.updateMany({
        where: {
          chapter: {
            courseId: courseId
          },
          isDeleted: false
        },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        }
      }),
      // コース内のチャプターを論理削除
      prisma.chapter.updateMany({
        where: {
          courseId: courseId,
          isDeleted: false
        },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        }
      }),
      // コースを論理削除
      prisma.course.update({
        where: {
          id: courseId
        },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        }
      })
    ]);

    return NextResponse.json({ 
      message: 'コースが削除されました',
      deletedCourseId: courseId 
    });
  } catch (error) {
    console.error('コース削除エラー:', error);
    return NextResponse.json(
      { error: 'コースの削除に失敗しました' },
      { status: 500 }
    );
  }
}