import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import LearnerHeader from "@/components/LearnerHeader";
import ToastProvider from "@/components/ToastProvider";
import LearnerErrorHandler from "@/components/LearnerErrorHandler";
import PersonalProgressStats from "@/components/PersonalProgressStats";
import RecentLearningActivity from "@/components/RecentLearningActivity";
import RecommendedLessons from "@/components/RecommendedLessons";
import { 
  calculateCourseProgress, 
  calculateOverallProgress, 
  getCurrentLesson,
  type CourseWithProgress 
} from "@/lib/progress-utils";

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
  const session = await requireAuth();
  const userId = session.user.id;

  // ユーザーの進捗データを含むコースデータを取得
  const courses = await prisma.course.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      chapters: {
        include: {
          lessons: {
            include: {
              progress: {
                where: { userId },
              },
            },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  // 最近の学習セッションを取得（レッスン情報なし）
  const recentSessions = await prisma.learningSession.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    take: 5,
  });

  // 基本コース一覧（進捗追跡用）
  const basicCourses = courses;

  // 各コースの進捗状況を計算（新しいロジック使用）
  const coursesWithProgressData = basicCourses.map((course) => {
    const courseProgress = calculateCourseProgress(course as CourseWithProgress);
    const currentLesson = getCurrentLesson(course as CourseWithProgress);
    
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
      lessonCount: courseProgress.totalLessons,
      completedLessons: courseProgress.completedLessons,
      inProgressLessons: courseProgress.inProgressLessons,
      progressRate: courseProgress.progressRate,
      currentLesson,
      hasProgress: courseProgress.status !== 'NOT_STARTED',
      ...techData,
    };
  });

  // 進行中のコース（進捗があるコース）
  const activeCourses = coursesWithProgressData.filter(course => course.hasProgress);

  // 学習統計を計算（新しいロジック使用）
  const overallProgress = calculateOverallProgress(basicCourses as CourseWithProgress[]);
  const totalLessonsCompleted = overallProgress.completedLessons;
  const totalLessonsInProgress = overallProgress.inProgressLessons;
  const totalLearningTime = recentSessions.reduce((total, session) => {
    if (session.endedAt) {
      return total + (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime());
    }
    return total;
  }, 0);

  // 学習ストリークを計算（簡易版）
  const today = new Date();
  // const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const hasLearningToday = recentSessions.some(session => {
    const sessionDate = new Date(session.startedAt);
    return sessionDate.toDateString() === today.toDateString();
  });
  // const hasLearningYesterday = recentSessions.some(session => {
  //   const sessionDate = new Date(session.startedAt);
  //   return sessionDate.toDateString() === yesterday.toDateString();
  // });
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <LearnerHeader />
      <LearnerErrorHandler />

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

        {/* 個人進捗統計 */}
        <PersonalProgressStats 
          totalCompleted={totalLessonsCompleted}
          totalInProgress={totalLessonsInProgress}
          totalLearningTime={totalLearningTime}
          hasLearningToday={hasLearningToday}
        />

        {/* 最近の学習活動 */}
        <RecentLearningActivity 
          recentSessions={recentSessions}
        />

        {/* 推奨レッスン */}
        <RecommendedLessons 
          coursesWithProgress={activeCourses}
        />

        {/* 学習中のコンテンツ */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">
              進行中のコース
            </h3>
            <Link
              href="/courses"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors cursor-pointer"
            >
              すべて見る →
            </Link>
          </div>
          
          {activeCourses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeCourses.slice(0, 4).map((course) => {
                const currentLessonIndex = course.currentLesson 
                  ? course.chapters.flatMap(c => c.lessons).findIndex(l => l.id === course.currentLesson?.id) + 1
                  : 1;

                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="group block cursor-pointer"
                  >
                    <div className="bg-linear-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-6 hover:border-cyan-400/50 transition-all duration-300 group-hover:shadow-sm group-hover:shadow-cyan-400/10 group-hover:-translate-y-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-linear-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm">
                          Lesson {currentLessonIndex}
                        </div>
                        <div className="text-right">
                          <div className="text-slate-400 text-sm">進捗</div>
                          <div className="text-cyan-400 text-lg font-bold">
                            {course.progressRate}%
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
                            {course.completedLessons}/{course.lessonCount} 完了
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-linear-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                            style={{
                              width: `${course.progressRate}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
              <div className="text-slate-400 text-4xl mb-4">🚀</div>
              <h4 className="text-white text-xl font-bold mb-2">学習を始めましょう！</h4>
              <p className="text-slate-400 mb-6">下記のコースから興味のあるものを選んで、学習をスタートしてください。</p>
              <Link
                href="/courses"
                className="inline-flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
              >
                コース一覧を見る
              </Link>
            </div>
          )}
        </section>

        {/* 学べる技術一覧 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">学べる技術一覧</h3>
            <div className="text-slate-400 text-sm">
              全{coursesWithProgressData.length}コース
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coursesWithProgressData.map((course) => (
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
                    
                    {/* 進捗バー */}
                    {course.hasProgress && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>進捗状況</span>
                          <span>{course.completedLessons}/{course.lessonCount}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                            style={{ width: `${course.progressRate}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="bg-slate-700 border border-slate-600 text-cyan-400 px-3 py-1 rounded-full text-sm font-medium">
                          {course.lessonCount}レッスン
                        </div>
                        {course.hasProgress && (
                          <div className="text-xs text-green-400 font-medium">
                            {course.progressRate}%
                          </div>
                        )}
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
      
      <ToastProvider />
    </div>
  );
}
