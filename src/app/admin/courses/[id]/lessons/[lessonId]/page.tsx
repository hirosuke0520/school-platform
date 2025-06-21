import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import LessonEditClient from '@/components/admin/LessonEditClient';

async function getLesson(courseId: string, lessonId: string) {
  try {
    const parsedCourseId = parseInt(courseId);
    const parsedLessonId = parseInt(lessonId);
    
    if (isNaN(parsedCourseId) || isNaN(parsedLessonId)) {
      return null;
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: parsedLessonId,
        chapter: {
          courseId: parsedCourseId
        },
        isDeleted: false
      },
      include: {
        chapter: {
          include: {
            course: true
          }
        }
      }
    });

    return lesson;
  } catch (error) {
    console.error('レッスン取得エラー:', error);
    return null;
  }
}

async function getChapters(courseId: number) {
  try {
    const chapters = await prisma.chapter.findMany({
      where: {
        courseId: courseId,
        isDeleted: false
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    return chapters;
  } catch (error) {
    console.error('チャプター取得エラー:', error);
    return [];
  }
}

interface PageProps {
  params: Promise<{
    id: string;
    lessonId: string;
  }>;
}

export default async function LessonPage({ params }: PageProps) {
  const resolvedParams = await params;
  const lesson = await getLesson(resolvedParams.id, resolvedParams.lessonId);

  if (!lesson) {
    notFound();
  }

  const chapters = await getChapters(lesson.chapter.courseId);

  return (
    <LessonEditClient 
      lesson={lesson}
      course={lesson.chapter.course}
      chapters={chapters}
    />
  );
}