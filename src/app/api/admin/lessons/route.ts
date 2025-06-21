import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// レッスン一覧取得
export async function GET() {
  try {
    const lessons = await prisma.lesson.findMany({
      where: {
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
      },
      orderBy: [
        {
          chapter: {
            course: {
              orderIndex: 'asc'
            }
          }
        },
        {
          chapter: {
            orderIndex: 'asc'
          }
        },
        {
          orderIndex: 'asc'
        }
      ]
    });

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error('レッスン取得エラー:', error);
    return NextResponse.json(
      { error: 'レッスンの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 新規レッスン作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, chapterId, estimatedMinutes, orderIndex, isPublished = false } = body;

    // バリデーション
    if (!title || !content || !chapterId) {
      return NextResponse.json(
        { error: 'レッスン名、内容、チャプターは必須です' },
        { status: 400 }
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

    // 同じチャプター内で同じorderIndexのレッスンが存在するかチェック
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        chapterId: parseInt(chapterId),
        orderIndex: orderIndex,
        isDeleted: false
      }
    });

    let finalOrderIndex = orderIndex;
    if (existingLesson) {
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

    // レッスン作成
    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        chapterId: parseInt(chapterId),
        estimatedMinutes: estimatedMinutes || null,
        orderIndex: finalOrderIndex,
        isPublished,
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

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    console.error('レッスン作成エラー:', error);
    return NextResponse.json(
      { error: 'レッスンの作成に失敗しました' },
      { status: 500 }
    );
  }
}