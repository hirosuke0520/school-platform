'use client';

import { useState } from "react";
import { PlusIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { Course, Chapter } from '@prisma/client';
import CourseCreateModal from "./CourseCreateModal";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CourseWithChapters = Course & {
  chapters: Chapter[];
};

interface CourseManagementProps {
  coursesWithChapters: CourseWithChapters[];
}

export default function CourseManagement({ coursesWithChapters }: CourseManagementProps) {
  const router = useRouter();
  const [isCourseCreateModalOpen, setIsCourseCreateModalOpen] = useState(false);

  // 作成後の処理
  const handleCourseCreated = () => {
    setIsCourseCreateModalOpen(false);
    router.refresh(); // サーバーコンポーネントを再読み込み
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">コース管理</h1>
          <p className="text-gray-600">コースの作成・管理</p>
        </div>
        <button
          onClick={() => setIsCourseCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          新規コース
        </button>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{coursesWithChapters.length}</div>
          <div className="text-sm text-gray-600">総コース数</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {coursesWithChapters.reduce((total, course) => total + course.chapters.length, 0)}
          </div>
          <div className="text-sm text-gray-600">総チャプター数</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {coursesWithChapters.length > 0 
              ? Math.round((coursesWithChapters.reduce((total, course) => total + course.chapters.length, 0) / coursesWithChapters.length) * 10) / 10
              : 0
            }
          </div>
          <div className="text-sm text-gray-600">平均チャプター数/コース</div>
        </div>
      </div>

      {/* コース一覧 */}
      <div className="space-y-4">
        {coursesWithChapters.map((course) => (
          <Link
            key={course.id}
            href={`/admin/courses/${course.id}`}
            className="block bg-white border rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpenIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {course.description || 'コースの説明がありません'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 ml-4">
                      <span>{course.chapters.length} チャプター</span>
                      <span>順序: {course.orderIndex}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.isActive ? 'アクティブ' : '非アクティブ'}
                      </span>
                    </div>
                  </div>
                  
                  {/* チャプター一覧プレビュー */}
                  {course.chapters.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {course.chapters.slice(0, 5).map((chapter) => (
                          <span key={chapter.id} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700">
                            {chapter.orderIndex}. {chapter.title}
                          </span>
                        ))}
                        {course.chapters.length > 5 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-xs text-gray-500">
                            他 {course.chapters.length - 5} チャプター
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {coursesWithChapters.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">コースがまだ作成されていません</p>
            <p className="text-sm">新規コース作成から始めましょう</p>
          </div>
        </div>
      )}

      {/* コース作成モーダル */}
      <CourseCreateModal
        isOpen={isCourseCreateModalOpen}
        onClose={() => setIsCourseCreateModalOpen(false)}
        onCourseCreated={handleCourseCreated}
      />
    </div>
  );
}