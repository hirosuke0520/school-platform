import Link from "next/link";
import { ChevronLeftIcon, StarIcon } from "@heroicons/react/20/solid";
import { StarIcon as StarIconSolid } from "@heroicons/react/20/solid";
import Breadcrumb from "../../../components/Breadcrumb";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function CourseDetail({ params }: { params: { id: string } }) {
  const courseId = parseInt(params.id);
  
  // DBからコースデータを取得
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        orderBy: { orderIndex: 'asc' },
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const breadcrumbItems = [{ name: course.title }];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xs border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-white" />
              </Link>
              <div className="relative">
                <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-sm">
                  <div className="w-6 h-6 border-2 border-white rounded-xs transform rotate-12"></div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">Code Strategy</h1>
                <p className="text-slate-400 text-xs">
                  プログラミング学習プラットフォーム
                </p>
              </div>
            </div>
            <div className="w-10 h-10 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-transform">
              <span className="text-slate-800 text-xs font-bold">検証</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Course Header */}
        <div className="bg-linear-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">{course.title}</h1>
          <p className="text-slate-300 text-lg">{course.description}</p>
        </div>

        {/* Course Content */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-6">学習内容</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {course.chapters.map((chapter) => {
              const estimatedMinutes = chapter.lessons.reduce((total, lesson) => total + (lesson.estimatedMinutes || 0), 0);
              
              return (
                <div
                  key={chapter.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {chapter.orderIndex}：{chapter.title}
                      </h3>
                      <p className="text-slate-400 text-sm mb-4">
                        (約{estimatedMinutes}分)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {chapter.lessons.map((lesson, index) => {
                      // 仮の完了状態（PHPコースのレッスンは完了済み、Laravelは未完了）
                      const completed = course.technology === 'PHP';
                      
                      return (
                        <Link
                          key={lesson.id}
                          href={`/lessons/${lesson.id}`}
                          className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors group"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-cyan-400 text-sm font-medium">
                              {lesson.orderIndex}.
                            </span>
                            <span className="text-white text-sm group-hover:text-cyan-400 transition-colors">
                              {lesson.title}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {completed ? (
                              <StarIconSolid className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <StarIcon className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
