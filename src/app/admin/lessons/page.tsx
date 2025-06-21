import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import LessonListClient from '@/components/admin/LessonListClient';

async function getLessons() {
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

    return lessons;
  } catch (error) {
    console.error('レッスン取得エラー:', error);
    return [];
  }
}

export default async function AdminLessonsPage() {
  const lessons = await getLessons();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">レッスン管理</h1>
          <p className="text-gray-600 mt-2">全レッスンの一覧・編集・削除ができます</p>
        </div>

        <Suspense fallback={<div className="text-center py-8">読み込み中...</div>}>
          <LessonListClient lessons={lessons} />
        </Suspense>
      </div>
    </div>
  );
}