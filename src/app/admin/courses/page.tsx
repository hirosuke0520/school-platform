import { prisma } from "@/lib/prisma";
import CourseManagement from "@/components/admin/CourseManagement";

export default async function CoursePage() {
  // コース一覧（チャプターのみ含む）
  const coursesWithChapters = await prisma.course.findMany({
    where: {
      isDeleted: false
    },
    include: {
      chapters: {
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
  });

  return <CourseManagement coursesWithChapters={coursesWithChapters} />;
}