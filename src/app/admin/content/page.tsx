import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PlusIcon, PencilIcon, EyeIcon, DocumentIcon } from "@heroicons/react/24/outline";

export default async function ContentPage() {
  const courses = await prisma.course.findMany({
    include: {
      chapters: {
        include: {
          lessons: true,
        },
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: { orderIndex: 'asc' },
  });

  const totalLessons = courses.reduce((total, course) => 
    total + course.chapters.reduce((chapterTotal, chapter) => 
      chapterTotal + chapter.lessons.length, 0
    ), 0
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">コンテンツ管理</h1>
          <p className="text-gray-600">コース・チャプター・レッスンの管理</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/admin/content/courses/new"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            新規コース
          </Link>
          <Link
            href="/admin/content/lessons/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            新規レッスン
          </Link>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
          <div className="text-sm text-gray-600">総コース数</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {courses.reduce((total, course) => total + course.chapters.length, 0)}
          </div>
          <div className="text-sm text-gray-600">総チャプター数</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">{totalLessons}</div>
          <div className="text-sm text-gray-600">総レッスン数</div>
        </div>
      </div>

      {/* コース一覧 */}
      <div className="space-y-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white border rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {course.technology}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{course.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>{course.chapters.length} チャプター</span>
                    <span>
                      {course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)} レッスン
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/courses/${course.id}`}
                    className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                    title="プレビュー"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/admin/content/courses/${course.id}/edit`}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                    title="編集"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* チャプター・レッスン一覧 */}
            <div className="p-6">
              <div className="space-y-4">
                {course.chapters.map((chapter) => (
                  <div key={chapter.id} className="border border-gray-200 rounded-lg">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-gray-900">
                          {chapter.orderIndex}. {chapter.title}
                        </h4>
                        <div className="flex space-x-2">
                          <span className="text-sm text-gray-500">
                            {chapter.lessons.length} レッスン
                          </span>
                          <Link
                            href={`/admin/content/chapters/${chapter.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                          >
                            <PencilIcon className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {chapter.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-2">
                              <DocumentIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {lesson.orderIndex}. {lesson.title}
                              </span>
                            </div>
                            <div className="flex space-x-1">
                              <Link
                                href={`/lessons/${lesson.id}`}
                                className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                                title="プレビュー"
                              >
                                <EyeIcon className="h-3 w-3" />
                              </Link>
                              <Link
                                href={`/admin/content/lessons/${lesson.id}/edit`}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                                title="編集"
                              >
                                <PencilIcon className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">コンテンツがまだ作成されていません</p>
            <p className="text-sm">新規コース作成から始めましょう</p>
          </div>
        </div>
      )}
    </div>
  );
}