import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

export default async function UserProgressDetail({ params }: { params: Promise<{ userId: string }> }) {
  await requireAuth();
  
  const resolvedParams = await params;
  const userId = resolvedParams.userId;

  // ユーザー情報と進捗データを取得
  const user = await prisma.user.findUnique({
    where: { 
      id: userId,
      isDeleted: false,
    },
    include: {
      progress: {
        include: {
          lesson: {
            include: {
              chapter: {
                include: {
                  course: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      learningSessions: {
        include: {
          lesson: {
            include: {
              chapter: {
                include: {
                  course: true,
                },
              },
            },
          },
        },
        orderBy: { startedAt: 'desc' },
      },
    },
  });

  if (!user || user.role !== 'LEARNER') {
    notFound();
  }

  // 全コースのデータを取得（進捗がないコースも含む）
  const allCourses = await prisma.course.findMany({
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
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: { orderIndex: 'asc' },
  });

  // コース進捗の計算
  const courseProgressData = allCourses.map(course => {
    const allLessons = course.chapters.flatMap(chapter => chapter.lessons);
    const completedLessons = allLessons.filter(lesson => 
      lesson.progress.some(p => p.status === 'COMPLETED')
    );
    // 進行中のレッスン数（将来の機能で使用予定）
    // const inProgressLessons = allLessons.filter(lesson => 
    //   lesson.progress.some(p => p.status === 'IN_PROGRESS')
    // );

    const progressRate = allLessons.length > 0 ? Math.round((completedLessons.length / allLessons.length) * 100) : 0;
    
    // コースの開始日・完了日
    const courseProgress = allLessons.flatMap(lesson => lesson.progress);
    const startDate = courseProgress.length > 0 ? 
      new Date(Math.min(...courseProgress.map(p => new Date(p.createdAt).getTime()))) : null;
    const endDate = courseProgress.some(p => p.completedAt) ? 
      new Date(Math.max(...courseProgress.filter(p => p.completedAt).map(p => new Date(p.completedAt!).getTime()))) : null;

    return {
      ...course,
      progressRate,
      startDate,
      endDate,
      totalLessons: allLessons.length,
      completedLessons: completedLessons.length,
      chapters: course.chapters.map(chapter => {
        const chapterLessons = chapter.lessons;
        const chapterCompleted = chapterLessons.filter(lesson => 
          lesson.progress.some(p => p.status === 'COMPLETED')
        );
        const chapterProgress = chapterLessons.flatMap(lesson => lesson.progress);
        const chapterStartDate = chapterProgress.length > 0 ? 
          new Date(Math.min(...chapterProgress.map(p => new Date(p.createdAt).getTime()))) : null;
        const chapterEndDate = chapterProgress.some(p => p.completedAt) ? 
          new Date(Math.max(...chapterProgress.filter(p => p.completedAt).map(p => new Date(p.completedAt!).getTime()))) : null;

        return {
          ...chapter,
          progressRate: chapterLessons.length > 0 ? Math.round((chapterCompleted.length / chapterLessons.length) * 100) : 0,
          startDate: chapterStartDate,
          endDate: chapterEndDate,
          totalLessons: chapterLessons.length,
          completedLessons: chapterCompleted.length,
          lessons: chapterLessons.map(lesson => {
            const lessonProgress = lesson.progress[0];
            return {
              ...lesson,
              startDate: lessonProgress?.createdAt ? new Date(lessonProgress.createdAt) : null,
              endDate: lessonProgress?.completedAt ? new Date(lessonProgress.completedAt) : null,
              status: lessonProgress?.status || 'NOT_STARTED',
            };
          })
        };
      })
    };
  });

  // 総学習時間の計算
  const totalLearningTime = user.learningSessions.reduce((total, session) => {
    if (session.endedAt) {
      return total + (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime());
    }
    return total;
  }, 0);

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}時間${minutes}分`;
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/progress"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name} の学習進捗</h1>
            <p className="text-gray-600 mt-1">{user.email}</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-600 rounded-lg">
                <span className="text-white text-lg">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">完了済み</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.progress.filter(p => p.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-600 rounded-lg">
                <span className="text-white text-lg">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">進行中</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.progress.filter(p => p.status === 'IN_PROGRESS').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-600 rounded-lg">
                <span className="text-white text-lg">🕒</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">総学習時間</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(totalLearningTime)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-600 rounded-lg">
                <span className="text-white text-lg">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">学習セッション</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.learningSessions.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Learning History */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">学習時間履歴</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    レッスン
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    開始時刻
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    終了時刻
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    学習時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    進捗報告
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {user.learningSessions.slice(0, 3).map((session) => {
                  const duration = session.endedAt 
                    ? new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()
                    : null;
                  
                  return (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {session.lesson.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.lesson.chapter.course.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(session.startedAt).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.endedAt 
                          ? new Date(session.endedAt).toLocaleString('ja-JP')
                          : '進行中'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {duration ? formatDuration(duration) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {session.progressReport ? (
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-900" title={session.progressReport}>
                              {truncateText(session.progressReport)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">未記入</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {user.learningSessions.length > 3 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                他 {user.learningSessions.length - 3} セッション
                <Link href="#" className="ml-2 text-blue-600 hover:text-blue-800">
                  すべて表示
                </Link>
              </p>
            </div>
          )}
          
          {user.learningSessions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">🕒</div>
              <p className="text-gray-500">まだ学習セッションがありません</p>
            </div>
          )}
        </div>

        {/* Course Progress */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">コース別進捗状況</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {courseProgressData.map((course) => (
              <details key={course.id} className="group">
                <summary className="flex cursor-pointer items-center justify-between p-6 hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          {course.completedLessons}/{course.totalLessons} 完了
                        </span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${course.progressRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {course.progressRate}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                      <span>
                        開始: {course.startDate ? course.startDate.toLocaleDateString('ja-JP') : '未開始'}
                      </span>
                      <span>
                        完了: {course.endDate ? course.endDate.toLocaleDateString('ja-JP') : '未完了'}
                      </span>
                    </div>
                  </div>
                  <ChevronDownIcon className="ml-4 h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                
                <div className="px-6 pb-6">
                  {course.chapters.map((chapter) => (
                    <details key={chapter.id} className="mt-4 group/chapter">
                      <summary className="flex cursor-pointer items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{chapter.title}</h4>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-600">
                                {chapter.completedLessons}/{chapter.totalLessons}
                              </span>
                              <div className="w-20 bg-gray-300 rounded-full h-1.5">
                                <div
                                  className="bg-green-600 h-1.5 rounded-full"
                                  style={{ width: `${chapter.progressRate}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 w-8">
                                {chapter.progressRate}%
                              </span>
                            </div>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                            <span>
                              開始: {chapter.startDate ? chapter.startDate.toLocaleDateString('ja-JP') : '未開始'}
                            </span>
                            <span>
                              完了: {chapter.endDate ? chapter.endDate.toLocaleDateString('ja-JP') : '未完了'}
                            </span>
                          </div>
                        </div>
                        <ChevronRightIcon className="ml-3 h-4 w-4 text-gray-400 group-open/chapter:rotate-90 transition-transform" />
                      </summary>
                      
                      <div className="mt-3 ml-4 space-y-2">
                        {chapter.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded">
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">{lesson.title}</span>
                              <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                                <span>
                                  開始: {lesson.startDate ? lesson.startDate.toLocaleDateString('ja-JP') : '未開始'}
                                </span>
                                <span>
                                  完了: {lesson.endDate ? lesson.endDate.toLocaleDateString('ja-JP') : '未完了'}
                                </span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              lesson.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-700'
                                : lesson.status === 'IN_PROGRESS'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {lesson.status === 'COMPLETED' && '完了'}
                              {lesson.status === 'IN_PROGRESS' && '進行中'}
                              {lesson.status === 'NOT_STARTED' && '未開始'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </details>
            ))}
          </div>
          
          {courseProgressData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">📚</div>
              <p className="text-gray-500">コースが登録されていません</p>
            </div>
          )}
        </div>
      </div>
  );
}