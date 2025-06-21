'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Course } from '@prisma/client';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';

interface CourseDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
}

export default function CourseDeleteModal({ isOpen, onClose, course }: CourseDeleteModalProps) {
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/courses/${course.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('コース削除完了', `「${course.title}」を削除しました`);
        onClose();
        router.push('/admin/courses'); // コース一覧に戻る
      } else {
        const errorMessage = data.error || 'コース削除に失敗しました';
        showError('コース削除失敗', errorMessage);
      }
    } catch (error) {
      showError('ネットワークエラー', 'ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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
                <h3 className="text-lg font-medium text-gray-900">コース削除</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 cursor-pointer"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      「<span className="font-medium text-gray-900">{course.title}</span>」を削除しますか？
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      この操作は取り消すことができません。このコースに含まれるすべてのチャプターとレッスンも削除されます。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? '削除中...' : '削除'}
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