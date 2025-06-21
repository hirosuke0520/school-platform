'use client';

import { useState } from "react";
import { PlusIcon, PencilIcon, EyeIcon, DocumentIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Course, Chapter, Lesson } from '@prisma/client';
import CourseCreateModal from "./CourseCreateModal";
import LessonCreateModal from "./LessonCreateModal";
import ChapterCreateModal from "./ChapterCreateModal";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CourseWithChaptersAndLessons = Course & {
  chapters: (Chapter & {
    lessons: Lesson[];
  })[];
};

interface ContentManagementProps {
  courses: Course[];
  coursesWithDetails: CourseWithChaptersAndLessons[];
}

export default function ContentManagement({ courses, coursesWithDetails }: ContentManagementProps) {
  const router = useRouter();
  const [isCourseCreateModalOpen, setIsCourseCreateModalOpen] = useState(false);
  const [isLessonCreateModalOpen, setIsLessonCreateModalOpen] = useState(false);
  const [isChapterCreateModalOpen, setIsChapterCreateModalOpen] = useState(false);

  // モーダルを閉じる時の処理
  const handleCloseModals = () => {
    setIsCourseCreateModalOpen(false);
    setIsLessonCreateModalOpen(false);
    setIsChapterCreateModalOpen(false);
  };

  // 作成後の処理
  const handleContentUpdated = () => {
    handleCloseModals();
    router.refresh(); // サーバーコンポーネントを再読み込み
  };

  const totalLessons = coursesWithDetails.reduce((total, course) => 
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
          <button
            onClick={() => setIsCourseCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            新規コース
          </button>
          <button
            onClick={() => setIsChapterCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            新規チャプター
          </button>
          <button
            onClick={() => setIsLessonCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            新規レッスン
          </button>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{coursesWithDetails.length}</div>
          <div className="text-sm text-gray-600">総コース数</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {coursesWithDetails.reduce((total, course) => total + course.chapters.length, 0)}
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
        {coursesWithDetails.map((course) => (
          <div key={course.id} className="bg-white border rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
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
                    href={`/admin/content/${course.id}`}
                    className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 cursor-pointer"
                    title="コース詳細"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                  <button
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 cursor-pointer"
                    title="編集"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    title="削除"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
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
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {chapter.lessons.length} レッスン
                          </span>
                          <button
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                            title="編集"
                          >
                            <PencilIcon className="h-3 w-3" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                            title="削除"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {chapter.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <DocumentIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {lesson.orderIndex}. {lesson.title}
                              </span>
                            </div>
                            <div className="flex space-x-1">
                              <Link
                                href={`/courses/${course.id}/chapters/${chapter.id}/lessons/${lesson.id}`}
                                className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                                title="プレビュー"
                              >
                                <EyeIcon className="h-3 w-3" />
                              </Link>
                              <button
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                                title="編集"
                              >
                                <PencilIcon className="h-3 w-3" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                                title="削除"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </button>
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

      {coursesWithDetails.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">コンテンツがまだ作成されていません</p>
            <p className="text-sm">新規コース作成から始めましょう</p>
          </div>
        </div>
      )}

      {/* モーダル */}
      <CourseCreateModal
        isOpen={isCourseCreateModalOpen}
        onClose={handleCloseModals}
        onCourseCreated={handleContentUpdated}
      />

      <ChapterCreateModal
        isOpen={isChapterCreateModalOpen}
        onClose={handleCloseModals}
        onChapterCreated={handleContentUpdated}
        courses={courses}
      />

      <LessonCreateModal
        isOpen={isLessonCreateModalOpen}
        onClose={handleCloseModals}
        onLessonCreated={handleContentUpdated}
        courses={courses}
      />
    </div>
  );
}