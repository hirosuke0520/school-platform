import Link from "next/link";
import { prisma } from "@/lib/prisma";

// アイコンマッピング
const technologyIcons: Record<string, { icon: string; color: string }> = {
  Git: { icon: "🔧", color: "bg-emerald-500" },
  HTML: { icon: "📝", color: "bg-orange-500" },
  CSS: { icon: "🎨", color: "bg-blue-500" },
  JavaScript: { icon: "⚡", color: "bg-yellow-500" },
  Linux: { icon: "🐧", color: "bg-gray-600" },
  Docker: { icon: "🐳", color: "bg-blue-600" },
  PHP: { icon: "🐘", color: "bg-indigo-600" },
  MySQL: { icon: "🗄️", color: "bg-orange-600" },
  Laravel: { icon: "🚀", color: "bg-red-600" },
};

export default async function Dashboard() {
  // DBからコースデータを取得
  const courses = await prisma.course.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      chapters: {
        include: {
          lessons: true,
        },
      },
    },
  });

  // 基本コース一覧用（ID 1-9）
  const basicCourses = courses.filter(course => course.id <= 9);
  
  // 進行中の学習（詳細コース ID 10, 11）
  const currentLearning = courses.filter(course => course.id >= 10);

  // 各コースのレッスン数を計算
  const coursesWithLessonCount = basicCourses.map((course) => {
    const lessonCount = course.chapters.reduce(
      (total, chapter) => total + chapter.lessons.length,
      0
    );
    
    // コースタイトルから技術を推測
    const title = course.title.toLowerCase();
    let technology = "";
    if (title.includes("git")) technology = "Git";
    else if (title.includes("html")) technology = "HTML";
    else if (title.includes("css")) technology = "CSS";
    else if (title.includes("javascript")) technology = "JavaScript";
    else if (title.includes("linux")) technology = "Linux";
    else if (title.includes("docker")) technology = "Docker";
    else if (title.includes("php")) technology = "PHP";
    else if (title.includes("mysql")) technology = "MySQL";
    else if (title.includes("laravel")) technology = "Laravel";
    
    const techData = technologyIcons[technology] || {
      icon: "📚",
      color: "bg-gray-500",
    };

    return {
      ...course,
      lessonCount,
      ...techData,
    };
  });
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xs border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Logo Icon - より洗練されたデザイン */}
              <div className="relative">
                <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-sm">
                  <div className="w-6 h-6 border-2 border-white rounded-xs transform rotate-12"></div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-white text-2xl font-bold">Code Strategy</h1>
                <p className="text-slate-400 text-sm">
                  プログラミング学習プラットフォーム
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-slate-300">
                <span className="text-sm">進捗率</span>
                <div className="w-20 h-2 bg-slate-700 rounded-full">
                  <div className="w-1/3 h-2 bg-cyan-400 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">33%</span>
              </div>
              <div className="w-10 h-10 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-transform">
                <span className="text-slate-800 text-xs font-bold">検証</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ウェルカムメッセージ */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            おかえりなさい！
          </h2>
          <p className="text-slate-400">
            今日も学習を続けましょう。あなたの成長をサポートします。
          </p>
        </div>

        {/* 学習中のコンテンツ */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">
              学習中のコンテンツ
            </h3>
            <Link
              href="/courses"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors cursor-pointer"
            >
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentLearning.map((course, index) => {
              const progress = index === 0 ? 0 : 8; // PHPは未開始、Laravelは8/9進行中
              const total = index === 0 ? 2 : 9;
              const lessonNumber = index === 0 ? 18 : 28;

              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group block cursor-pointer"
                >
                  <div className="bg-linear-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-6 hover:border-cyan-400/50 transition-all duration-300 group-hover:shadow-sm group-hover:shadow-cyan-400/10 group-hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-linear-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm">
                        Lesson {lessonNumber}
                      </div>
                      <div className="text-right">
                        <div className="text-slate-400 text-sm">進捗</div>
                        <div className="text-cyan-400 text-lg font-bold">
                          {Math.round((progress / total) * 100)}%
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-white text-2xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-slate-300 text-base">
                        {course.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">学習進捗</span>
                        <span className="text-white font-medium">
                          {progress}/{total} 完了
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-linear-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                          style={{
                            width: `${
                              progress === 0 ? 8 : (progress / total) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 学べる技術一覧 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">学べる技術一覧</h3>
            <div className="text-slate-400 text-sm">
              全{coursesWithLessonCount.length}コース
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coursesWithLessonCount.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group block cursor-pointer"
              >
                <div className="bg-slate-800 border border-slate-700 rounded-sm overflow-hidden hover:border-cyan-400/50 transition-all duration-300 group-hover:shadow-xs group-hover:shadow-cyan-400/10 group-hover:-translate-y-1">
                  <div className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div
                        className={`${course.color} w-12 h-12 rounded-xs flex items-center justify-center text-white text-xl shadow-sm`}
                      >
                        {course.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">
                          {course.title.includes("(")
                            ? course.title.split("(")[0]
                            : course.title}
                        </h4>
                        {course.title.includes("(") && (
                          <span className="text-slate-400 text-sm">
                            {course.title.match(/\((.*?)\)/)?.[1]}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="bg-slate-700 border border-slate-600 text-cyan-400 px-3 py-1 rounded-full text-sm font-medium">
                        {course.lessonCount}レッスン
                      </div>
                      <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">
                        →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* フッター情報 */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="text-center text-slate-400 text-sm">
            <p>
              継続は力なり。毎日少しずつでも学習を続けることが成長への鍵です。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
