import { prisma } from "@/lib/prisma";
import ContentManagement from "@/components/admin/ContentManagement";

export default async function ContentPage() {
  // DB操作をサーバーコンポーネントで実行
  const [courses, coursesWithDetails] = await Promise.all([
    // コース一覧（基本情報）
    prisma.course.findMany({
      where: {
        isDeleted: false
      },
      orderBy: {
        orderIndex: 'asc'
      }
    }),
    // コース詳細（チャプター・レッスン含む）
    prisma.course.findMany({
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
    })
  ]);

  return <ContentManagement courses={courses} coursesWithDetails={coursesWithDetails} />;
}