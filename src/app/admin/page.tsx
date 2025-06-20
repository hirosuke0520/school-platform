import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/dateUtils";
import { UserGroupIcon, BookOpenIcon, ClockIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

export default async function AdminDashboard() {
  // 基本統計データを取得
  const [userCount, courseCount, lessonCount, totalSessions, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.lesson.count(),
    prisma.learningSession.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  const stats = [
    {
      name: '登録ユーザー数',
      value: userCount.toString(),
      icon: UserGroupIcon,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      name: 'コース数',
      value: courseCount.toString(),
      icon: BookOpenIcon,
      color: 'text-green-600 bg-green-100',
    },
    {
      name: 'レッスン数',
      value: lessonCount.toString(),
      icon: AcademicCapIcon,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      name: '学習セッション',
      value: totalSessions.toString(),
      icon: ClockIcon,
      color: 'text-orange-600 bg-orange-100',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ダッシュボード</h1>
        <p className="text-gray-600">学習プラットフォームの概要</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 最近の活動 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">最近追加されたユーザー</h3>
          </div>
          <div className="p-6">
            {recentUsers.length > 0 ? (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name || '名前未設定'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'ADMIN' ? '管理者' : user.role === 'INSTRUCTOR' ? '講師' : '学習者'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{formatDateShort(user.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">まだユーザーが登録されていません</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">人気のコース</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-sm">コンテンツ管理ページで詳細を確認できます</p>
          </div>
        </div>
      </div>
    </div>
  );
}