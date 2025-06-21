'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/contexts/ToastContext';

interface Lesson {
  id: number;
  title: string;
  content: string;
  estimatedMinutes: number | null;
  orderIndex: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  chapter: {
    id: number;
    title: string;
    course: {
      id: number;
      title: string;
    };
  };
}

interface LessonListClientProps {
  lessons: Lesson[];
}

export default function LessonListClient({ lessons: initialLessons }: LessonListClientProps) {
  const { showSuccess, showError } = useToast();
  const [lessons, setLessons] = useState(initialLessons);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // フィルタリングされたレッスン
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.chapter.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === '' || lesson.chapter.course.id.toString() === selectedCourse;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'draft' && !lesson.isPublished) ||
                         (statusFilter === 'published' && lesson.isPublished);
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  // ユニークなコース一覧
  const courses = Array.from(
    new Set(lessons.map(lesson => lesson.chapter.course.id))
  ).map(courseId => {
    const lesson = lessons.find(l => l.chapter.course.id === courseId);
    return lesson ? lesson.chapter.course : null;
  }).filter(Boolean);

  // レッスン削除
  const handleDelete = async (lessonId: number, lessonTitle: string) => {
    if (!confirm(`「${lessonTitle}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
        showSuccess('削除完了', `「${lessonTitle}」を削除しました`);
      } else {
        const data = await response.json();
        showError('削除失敗', data.error || 'レッスンの削除に失敗しました');
      }
    } catch (error) {
      showError('ネットワークエラー', 'ネットワークエラーが発生しました');
    }
  };

  return (
    <div className="space-y-6">
      {/* 検索・フィルター */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* 検索 */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="レッスン名、チャプター名、コース名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* コースフィルター */}
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">全コース</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>

            {/* ステータスフィルター */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全ステータス</option>
              <option value="draft">下書き</option>
              <option value="published">公開済み</option>
            </select>
          </div>

          {/* 新規作成ボタン */}
          <Link
            href="/admin/courses"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            新規レッスン作成
          </Link>
        </div>
      </div>

      {/* レッスン一覧 */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-12">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">レッスンが見つかりません</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCourse || statusFilter !== 'all' 
                ? '検索条件を変更してください' 
                : '新しいレッスンを作成してください'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    レッスン情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    所属
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    学習時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    順序
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    更新日
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {lesson.isPublished ? (
                          <DocumentCheckIcon className="h-5 w-5 text-green-500 mr-3" />
                        ) : (
                          <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                          <div className="text-sm text-gray-500">ID: {lesson.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{lesson.chapter.course.title}</div>
                      <div className="text-sm text-gray-500">{lesson.chapter.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        lesson.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {lesson.isPublished ? '公開済み' : '下書き'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {lesson.estimatedMinutes ? `${lesson.estimatedMinutes}分` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {lesson.orderIndex}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(lesson.updatedAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* 編集・プレビュー */}
                        <Link
                          href={`/courses/${lesson.chapter.course.id}/lessons/${lesson.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 cursor-pointer"
                          title="編集・プレビュー"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>

                        {/* 削除 */}
                        <button
                          onClick={() => handleDelete(lesson.id, lesson.title)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 cursor-pointer"
                          title="削除"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 統計情報 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{lessons.length}</div>
            <div className="text-sm text-gray-500">総レッスン数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {lessons.filter(l => !l.isPublished).length}
            </div>
            <div className="text-sm text-gray-500">下書き</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {lessons.filter(l => l.isPublished).length}
            </div>
            <div className="text-sm text-gray-500">公開済み</div>
          </div>
        </div>
      </div>
    </div>
  );
}