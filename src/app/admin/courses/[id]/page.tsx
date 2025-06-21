import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CourseDetailClient from '@/components/admin/CourseDetailClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const courseId = parseInt(params.id);

  if (isNaN(courseId)) {
    notFound();
  }

  // コース詳細情報を取得
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
    notFound();
  }

  // すべてのコース一覧も取得（チャプター作成時のモーダルで使用）
  const allCourses = await prisma.course.findMany({
    where: {
      isDeleted: false
    },
    orderBy: {
      orderIndex: 'asc'
    }
  });

  return (
    <CourseDetailClient 
      course={course} 
      allCourses={allCourses}
    />
  );
}