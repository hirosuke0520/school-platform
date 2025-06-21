import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/20/solid";
import Breadcrumb from "../../../components/Breadcrumb";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function LessonDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const lessonId = parseInt(resolvedParams.id);
  
  // DBからレッスンデータを取得
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapter: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  // 前後のレッスンを取得
  const allLessons = await prisma.lesson.findMany({
    where: {
      chapter: {
        courseId: lesson.chapter.course.id,
      },
    },
    include: {
      chapter: true,
    },
    orderBy: [
      { chapter: { orderIndex: 'asc' } },
      { orderIndex: 'asc' },
    ],
  });

  const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const breadcrumbItems = [
    { name: lesson.chapter.course.title, href: `/courses/${lesson.chapter.course.id}` },
    { name: lesson.chapter.title },
    { name: lesson.title },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xs border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/courses/${lesson.chapter.course.id}`}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Lesson Header */}
        <div className="bg-linear-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{lesson.title}</h1>
          <p className="text-slate-400 text-sm">
            {lesson.chapter.course.title} &gt; {lesson.chapter.title}
          </p>
        </div>

        {/* Lesson Content */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8">
          <div className="prose prose-slate prose-invert max-w-none">
            <div
              className="text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: lesson.content
                  .replace(
                    /^# (.+)$/gm,
                    '<h1 class="text-2xl font-bold text-white mb-4 mt-8 first:mt-0">$1</h1>'
                  )
                  .replace(
                    /^## (.+)$/gm,
                    '<h2 class="text-xl font-bold text-cyan-400 mb-3 mt-6">$1</h2>'
                  )
                  .replace(
                    /^### (.+)$/gm,
                    '<h3 class="text-lg font-bold text-white mb-2 mt-4">$1</h3>'
                  )
                  .replace(/^\- (.+)$/gm, '<li class="ml-4 mb-1">$1</li>')
                  .replace(
                    /^\*\*(.+?)\*\*/gm,
                    '<strong class="text-white font-bold">$1</strong>'
                  )
                  .replace(
                    /^```(\w+)?\n([\s\S]*?)```$/gm,
                    '<pre class="bg-slate-900 border border-slate-600 rounded-lg p-4 my-4 overflow-x-auto"><code class="text-cyan-300 text-sm">$2</code></pre>'
                  )
                  .replace(
                    /`([^`]+)`/g,
                    '<code class="bg-slate-700 text-cyan-300 px-2 py-1 rounded text-sm">$1</code>'
                  )
                  .replace(/\n\n/g, '</p><p class="mb-4">')
                  .replace(/^(.+)$/gm, '<p class="mb-4">$1</p>'),
              }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            {prevLesson ? (
              <Link
                href={`/lessons/${prevLesson.id}`}
                className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 hover:border-cyan-400/50 transition-colors group"
              >
                <ChevronLeftIcon className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                <div className="text-left">
                  <div className="text-slate-400 text-xs">前のレッスン</div>
                  <div className="text-white text-sm group-hover:text-cyan-400 transition-colors">
                    {prevLesson.title}
                  </div>
                </div>
              </Link>
            ) : (
              <div></div>
            )}
          </div>

          <Link
            href={`/courses/${lesson.chapter.course.id}`}
            className="bg-slate-700 border border-slate-600 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            コースに戻る
          </Link>

          <div>
            {nextLesson ? (
              <Link
                href={`/lessons/${nextLesson.id}`}
                className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 hover:border-cyan-400/50 transition-colors group"
              >
                <div className="text-right">
                  <div className="text-slate-400 text-xs">次のレッスン</div>
                  <div className="text-white text-sm group-hover:text-cyan-400 transition-colors">
                    {nextLesson.title}
                  </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
