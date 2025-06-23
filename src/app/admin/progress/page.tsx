import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProgressManagement() {
  await requireAuth();

  // ユーザーと進捗データを取得
  const users = await prisma.user.findMany({
    where: {
      role: 'LEARNER',
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
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // コース一覧も取得
  const courses = await prisma.course.findMany({
    include: {
      chapters: {
        include: {
          lessons: true,
        },
      },
    },
    orderBy: { orderIndex: 'asc' },
  });

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">学習進捗管理</h1>
            <p className="text-gray-600 mt-1">
              学習者の進捗状況を確認・管理できます
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-600 rounded-lg">
                <span className="text-white text-lg">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">総学習者数</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-600 rounded-lg">
                <span className="text-white text-lg">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">総コース数</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-600 rounded-lg">
                <span className="text-white text-lg">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">総レッスン数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.reduce((total, course) => 
                    total + course.chapters.reduce((chapterTotal, chapter) => 
                      chapterTotal + chapter.lessons.length, 0
                    ), 0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-600 rounded-lg">
                <span className="text-white text-lg">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">完了済み進捗</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.reduce((total, user) => 
                    total + user.progress.filter(p => p.status === 'COMPLETED').length, 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Progress Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">学習者別進捗状況</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    学習者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    進捗中
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    完了済み
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最終活動
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const inProgressCount = user.progress.filter(p => p.status === 'IN_PROGRESS').length;
                  const completedCount = user.progress.filter(p => p.status === 'COMPLETED').length;
                  const lastActivity = user.progress.length > 0 
                    ? new Date(Math.max(...user.progress.map(p => new Date(p.createdAt).getTime())))
                    : null;

                  return (
                    <Link
                      key={user.id}
                      href={`/admin/progress/${user.id}`}
                      className="table-row hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {user.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {inProgressCount} レッスン
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {completedCount} レッスン
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lastActivity ? lastActivity.toLocaleDateString('ja-JP') : '活動なし'}
                      </td>
                    </Link>
                  );
                })}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">📚</div>
              <p className="text-gray-500">まだ学習者が登録されていません</p>
            </div>
          )}
        </div>
      </div>
  );
}