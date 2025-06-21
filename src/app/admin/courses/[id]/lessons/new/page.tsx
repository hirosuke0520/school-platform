import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import LessonCreateClient from '@/components/admin/LessonCreateClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function LessonCreatePage({ params }: PageProps) {
  const courseId = parseInt(params.id);

  if (isNaN(courseId)) {
    notFound();
  }

  // コース情報とチャプター一覧を取得
  const [course, chapters] = await Promise.all([
    prisma.course.findFirst({
      where: {
        id: courseId,
        isDeleted: false
      }
    }),
    prisma.chapter.findMany({
      where: {
        courseId: courseId,
        isDeleted: false
      },
      orderBy: {
        orderIndex: 'asc'
      }
    })
  ]);

  if (!course) {
    notFound();
  }

  return (
    <LessonCreateClient 
      course={course}
      chapters={chapters}
    />
  );
}