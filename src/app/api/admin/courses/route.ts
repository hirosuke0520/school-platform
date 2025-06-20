import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// コース一覧取得
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: {
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
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('コース取得エラー:', error);
    return NextResponse.json(
      { error: 'コースの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 新規コース作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, orderIndex } = body;

    // バリデーション
    if (!title) {
      return NextResponse.json(
        { error: 'コース名は必須です' },
        { status: 400 }
      );
    }

    // 同じorderIndexのコースが存在するかチェック
    const existingCourse = await prisma.course.findFirst({
      where: {
        orderIndex: orderIndex,
        isDeleted: false
      }
    });

    let finalOrderIndex = orderIndex;
    if (existingCourse) {
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

    // コース作成
    const course = await prisma.course.create({
      data: {
        title,
        description,
        orderIndex: finalOrderIndex,
        isActive: true,
        isDeleted: false
      }
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error('コース作成エラー:', error);
    return NextResponse.json(
      { error: 'コースの作成に失敗しました' },
      { status: 500 }
    );
  }
}