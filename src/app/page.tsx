import Link from "next/link";

// モックデータ
const currentLearning = [
  {
    id: 1,
    title: "PHP",
    subtitle: "変数と定数",
    progress: 0,
    total: 2,
    lesson: 18,
  },
  {
    id: 2,
    title: "Laravel",
    subtitle: "Eloquent",
    progress: 8,
    total: 9,
    lesson: 28,
  },
];

const technologies = [
  {
    id: 1,
    name: "Git(バージョン管理)",
    description: "ソースコードを管理するためのシステム",
    lessons: 2,
    color: "bg-emerald-500",
    icon: "🔧",
  },
  {
    id: 2,
    name: "HTML",
    description: "Webページの構造をつくるための言語",
    lessons: 2,
    color: "bg-orange-500",
    icon: "📝",
  },
  {
    id: 3,
    name: "CSS",
    description: "Webページを装飾するための言語",
    lessons: 4,
    color: "bg-blue-500",
    icon: "🎨",
  },
  {
    id: 4,
    name: "JavaScript",
    description: "HTMLやCSSで作った構造や装飾を操作するための言語",
    lessons: 4,
    color: "bg-yellow-500",
    icon: "⚡",
  },
  {
    id: 5,
    name: "Linux",
    description: "オープンソースで広く使われているOS",
    lessons: 2,
    color: "bg-gray-600",
    icon: "🐧",
  },
  {
    id: 6,
    name: "Docker(仮想環境構築)",
    description: "仮想環境を作成するためのプラットフォーム",
    lessons: 2,
    color: "bg-blue-600",
    icon: "🐳",
  },
  {
    id: 7,
    name: "PHP",
    description: "Webアプリの作成に使われるプログラミング言語",
    lessons: 6,
    color: "bg-indigo-600",
    icon: "🐘",
  },
  {
    id: 8,
    name: "MySQL",
    description: "データベースを管理するシステム",
    lessons: 4,
    color: "bg-orange-600",
    icon: "🗄️",
  },
  {
    id: 9,
    name: "Laravel",
    description: "人気の高いPHPのフレームワーク",
    lessons: 2,
    color: "bg-red-600",
    icon: "🚀",
  },
];

export default function Dashboard() {
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
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentLearning.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group block"
              >
                <div className="bg-linear-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-6 hover:border-cyan-400/50 transition-all duration-300 group-hover:shadow-sm group-hover:shadow-cyan-400/10 group-hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-linear-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm">
                      Lesson {course.lesson}
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-sm">進捗</div>
                      <div className="text-cyan-400 text-lg font-bold">
                        {Math.round((course.progress / course.total) * 100)}%
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-white text-2xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-slate-300 text-base">
                      {course.subtitle}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">学習進捗</span>
                      <span className="text-white font-medium">
                        {course.progress}/{course.total} 完了
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-linear-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                        style={{
                          width: `${
                            course.progress === 0
                              ? 8
                              : (course.progress / course.total) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 学べる技術一覧 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">学べる技術一覧</h3>
            <div className="text-slate-400 text-sm">
              全{technologies.length}コース
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technologies.map((tech) => (
              <Link
                key={tech.id}
                href={`/courses/${tech.id}`}
                className="group block"
              >
                <div className="bg-slate-800 border border-slate-700 rounded-sm overflow-hidden hover:border-cyan-400/50 transition-all duration-300 group-hover:shadow-xs group-hover:shadow-cyan-400/10 group-hover:-translate-y-1">
                  <div className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div
                        className={`${tech.color} w-12 h-12 rounded-xs flex items-center justify-center text-white text-xl shadow-sm`}
                      >
                        {tech.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">
                          {tech.name.includes("(")
                            ? tech.name.split("(")[0]
                            : tech.name}
                        </h4>
                        {tech.name.includes("(") && (
                          <span className="text-slate-400 text-sm">
                            {tech.name.match(/\((.*?)\)/)?.[1]}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                      {tech.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="bg-slate-700 border border-slate-600 text-cyan-400 px-3 py-1 rounded-full text-sm font-medium">
                        {tech.lessons}レッスン
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
