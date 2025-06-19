import Link from "next/link";
import { ChevronLeftIcon, StarIcon } from "@heroicons/react/20/solid";
import { StarIcon as StarIconSolid } from "@heroicons/react/20/solid";
import Breadcrumb from "../../../components/Breadcrumb";

// モックデータ
const courseData = {
  1: {
    title: "PHPを理解する",
    description: "PHPとはどんなものなのかを理解しましょう。",
    chapters: [
      {
        id: 1,
        title: "URLをパーツに分けて理解する",
        duration: "約15分",
        lessons: [{ id: 1, title: "URLを分解して見てみよう", completed: true }],
      },
      {
        id: 2,
        title: "リクエストとレスポンス",
        duration: "約10分",
        lessons: [{ id: 2, title: "リクエストとレスポンス", completed: true }],
      },
      {
        id: 3,
        title: "WEBサーバーについて",
        duration: "約10分",
        lessons: [{ id: 3, title: "Webサーバーについて", completed: true }],
      },
      {
        id: 4,
        title: "アプリケーションサーバーについて",
        duration: "約10分",
        lessons: [
          { id: 4, title: "アプリケーションサーバーについて", completed: true },
        ],
      },
      {
        id: 5,
        title: "フロントエンドとは",
        duration: "約5分",
        lessons: [{ id: 5, title: "フロントエンドとは", completed: true }],
      },
      {
        id: 6,
        title: "バックエンドとは",
        duration: "約10分",
        lessons: [{ id: 6, title: "バックエンドとは", completed: true }],
      },
      {
        id: 7,
        title: "プログラミング言語について",
        duration: "約20分",
        lessons: [
          { id: 7, title: "PHPとは？", completed: true },
          {
            id: 8,
            title: "PHPファイルを作成して表示してみよう",
            completed: true,
          },
        ],
      },
      {
        id: 8,
        title: "プログラミング用エディタについて",
        duration: "約5分",
        lessons: [
          {
            id: 9,
            title: "プログラミング用のエディタについて",
            completed: true,
          },
        ],
      },
    ],
  },
  2: {
    title: "Laravel基礎",
    description: "LaravelでWebアプリケーション開発の基礎を学びましょう。",
    chapters: [
      {
        id: 1,
        title: "Laravelとは",
        duration: "約20分",
        lessons: [
          { id: 10, title: "Laravelフレームワークの概要", completed: false },
          { id: 11, title: "MVCアーキテクチャについて", completed: false },
        ],
      },
      {
        id: 2,
        title: "Eloquent ORM",
        duration: "約30分",
        lessons: [
          { id: 12, title: "Eloquentの基本", completed: false },
          { id: 13, title: "リレーションシップ", completed: false },
        ],
      },
    ],
  },
};

export default function CourseDetail({ params }: { params: { id: string } }) {
  const courseId = parseInt(params.id);
  const course = courseData[courseId as keyof typeof courseData];

  if (!course) {
    return <div>コースが見つかりません</div>;
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
            {course.chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {chapter.id}：{chapter.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                      ({chapter.duration})
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {chapter.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/lessons/${lesson.id}`}
                      className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-cyan-400 text-sm font-medium">
                          {lesson.id}.
                        </span>
                        <span className="text-white text-sm group-hover:text-cyan-400 transition-colors">
                          {lesson.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {lesson.completed ? (
                          <StarIconSolid className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <StarIcon className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
