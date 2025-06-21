"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { Course, Chapter, Lesson } from "@prisma/client";
import ChapterCreateModal from "./ChapterCreateModal";
import ChapterEditModal from "./ChapterEditModal";
import ChapterDeleteModal from "./ChapterDeleteModal";
import CourseDeleteModal from "./CourseDeleteModal";

type CourseWithChaptersAndLessons = Course & {
  chapters: (Chapter & {
    lessons: Lesson[];
  })[];
};

interface CourseDetailClientProps {
  course: CourseWithChaptersAndLessons;
  allCourses: Course[];
}

export default function CourseDetailClient({
  course,
  allCourses,
}: CourseDetailClientProps) {
  const router = useRouter();
  const [isChapterCreateModalOpen, setIsChapterCreateModalOpen] =
    useState(false);
  const [isChapterEditModalOpen, setIsChapterEditModalOpen] = useState(false);
  const [isChapterDeleteModalOpen, setIsChapterDeleteModalOpen] =
    useState(false);
  const [isCourseDeleteModalOpen, setIsCourseDeleteModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set()
  );

  // チャプターの展開/折りたたみ
  const toggleChapter = (chapterId: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  // 初期状態で全チャプターを展開
  useState(() => {
    const allChapterIds = new Set(course.chapters.map((chapter) => chapter.id));
    setExpandedChapters(allChapterIds);
  });

  // チャプター作成後の処理
  const handleChapterCreated = () => {
    setIsChapterCreateModalOpen(false);
    router.refresh();
  };

  // チャプター更新後の処理
  const handleChapterUpdated = () => {
    setIsChapterEditModalOpen(false);
    setSelectedChapter(null);
    router.refresh();
  };

  // チャプター削除後の処理
  const handleChapterDeleted = () => {
    setIsChapterDeleteModalOpen(false);
    setSelectedChapter(null);
    router.refresh();
  };

  // チャプター編集モーダルを開く
  const openEditModal = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsChapterEditModalOpen(true);
  };

  // チャプター削除モーダルを開く
  const openDeleteModal = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsChapterDeleteModalOpen(true);
  };

  // 統計情報の計算
  const totalLessons = course.chapters.reduce(
    (total, chapter) => total + chapter.lessons.length,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/admin/courses"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            コース一覧に戻る
          </Link>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {course.title}
            </h1>
            <p className="text-gray-600 text-lg mb-4">{course.description}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>表示順序: {course.orderIndex}</span>
              <span>{course.chapters.length} チャプター</span>
              <span>{totalLessons} レッスン</span>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/courses/${course.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              プレビュー
            </Link>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              <PencilIcon className="h-4 w-4 mr-2" />
              コース編集
            </button>
            <button
              onClick={() => setIsCourseDeleteModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 border-red-300 cursor-pointer"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              コース削除
            </button>
            <button
              onClick={() => setIsChapterCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              新規チャプター
            </button>
            <Link
              href={`/admin/courses/${course.id}/lessons/new`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 cursor-pointer"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              新規レッスン
            </Link>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="bg-white p-6 rounded-lg border shadow-sm mb-8">
        <div className="flex items-center space-x-8">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {course.chapters.length}
            </div>
            <div className="text-sm text-gray-600">チャプター数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {totalLessons}
            </div>
            <div className="text-sm text-gray-600">総レッスン数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(
                (totalLessons / Math.max(course.chapters.length, 1)) * 10
              ) / 10}
            </div>
            <div className="text-sm text-gray-600">
              平均レッスン数/チャプター
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {course.isActive ? "アクティブ" : "非アクティブ"}
            </div>
            <div className="text-sm text-gray-600">ステータス</div>
          </div>
        </div>
      </div>

      {/* チャプター一覧 */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            チャプター一覧
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {course.chapters.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                チャプターがまだ作成されていません
              </h3>
              <p className="text-gray-500 mb-4">
                新規チャプターを作成してコンテンツを追加しましょう
              </p>
              <button
                onClick={() => setIsChapterCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                最初のチャプターを作成
              </button>
            </div>
          ) : (
            course.chapters.map((chapter) => (
              <div key={chapter.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center space-x-3 flex-1 cursor-pointer"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <button className="p-1 hover:bg-gray-100 rounded">
                      {expandedChapters.has(chapter.id) ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {chapter.orderIndex}. {chapter.title}
                      </h3>
                      {chapter.description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {chapter.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{chapter.lessons.length} レッスン</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(chapter)}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 cursor-pointer"
                      title="チャプター編集"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(chapter)}
                      className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 cursor-pointer"
                      title="チャプター削除"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* レッスン一覧（展開時のみ表示） */}
                {expandedChapters.has(chapter.id) && (
                  <div className="mt-4 ml-8">
                    {chapter.lessons.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <DocumentIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500 text-sm mb-3">
                          このチャプターにはまだレッスンがありません
                        </p>
                        <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-green-600 hover:bg-green-700 cursor-pointer">
                          <PlusIcon className="h-3 w-3 mr-1" />
                          レッスンを作成
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          レッスン一覧
                        </h4>
                        {chapter.lessons.map((lesson) => (
                          <Link
                            key={lesson.id}
                            href={`/admin/courses/${course.id}/lessons/${lesson.id}`}
                            className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  {lesson.orderIndex}. {lesson.title}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    lesson.isPublished
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {lesson.isPublished ? "公開済み" : "下書き"}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* モーダル */}
      <ChapterCreateModal
        isOpen={isChapterCreateModalOpen}
        onClose={() => setIsChapterCreateModalOpen(false)}
        onChapterCreated={handleChapterCreated}
        courses={allCourses}
        selectedCourseId={course.id}
      />

      <ChapterEditModal
        isOpen={isChapterEditModalOpen}
        onClose={() => setIsChapterEditModalOpen(false)}
        onChapterUpdated={handleChapterUpdated}
        chapter={selectedChapter}
        courses={allCourses}
      />

      <ChapterDeleteModal
        isOpen={isChapterDeleteModalOpen}
        onClose={() => setIsChapterDeleteModalOpen(false)}
        onChapterDeleted={handleChapterDeleted}
        chapter={selectedChapter}
      />

      <CourseDeleteModal
        isOpen={isCourseDeleteModalOpen}
        onClose={() => setIsCourseDeleteModalOpen(false)}
        course={course}
      />
    </div>
  );
}
