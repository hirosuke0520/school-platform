'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Course, Chapter } from '@prisma/client';
import { useToast } from '@/contexts/ToastContext';

interface ChapterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChapterUpdated: () => void;
  chapter: Chapter | null;
  courses: Course[];
}

export default function ChapterEditModal({ isOpen, onClose, onChapterUpdated, chapter, courses }: ChapterEditModalProps) {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    orderIndex: 1,
  });

  // モーダルが開かれるたびにフォームを初期化
  useEffect(() => {
    if (isOpen && chapter) {
      setFormData({
        title: chapter.title,
        description: chapter.description || '',
        courseId: chapter.courseId.toString(),
        orderIndex: chapter.orderIndex,
      });
      setError('');
    }
  }, [isOpen, chapter]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapter) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/chapters/${chapter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('チャプター更新完了', `「${formData.title}」を更新しました`);
        onChapterUpdated();
      } else {
        const errorMessage = data.error || 'チャプター更新に失敗しました';
        setError(errorMessage);
        showError('チャプター更新失敗', errorMessage);
      }
    } catch (error) {
      const errorMessage = 'ネットワークエラーが発生しました';
      setError(errorMessage);
      showError('ネットワークエラー', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'orderIndex' ? parseInt(value) || 1 : value,
    }));
  };

  if (!isOpen || !chapter) return null;

  return (
    <>
      {/* 背景オーバーレイ */}
      <div 
        className="fixed inset-0 bg-gray-500 opacity-70 transition-opacity z-40"
        onClick={onClose}
      ></div>

      {/* モーダルコンテナ */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
          {/* モーダルコンテンツ */}
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">チャプター編集</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 cursor-pointer"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    チャプター名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例: 基本構文の理解"
                  />
                </div>

                <div>
                  <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
                    所属コース <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="courseId"
                    name="courseId"
                    required
                    value={formData.courseId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">コースを選択してください</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    説明
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="チャプターの概要を入力してください"
                  />
                </div>

                <div>
                  <label htmlFor="orderIndex" className="block text-sm font-medium text-gray-700 mb-1">
                    表示順序 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="orderIndex"
                    name="orderIndex"
                    required
                    min="1"
                    value={formData.orderIndex}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </form>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? '更新中...' : 'チャプターを更新'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}