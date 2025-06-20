"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Course, Chapter } from "@prisma/client";
import { useToast } from "@/contexts/ToastContext";

interface LessonCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLessonCreated: () => void;
  courses: Course[];
}

type ChapterWithCourse = Chapter & {
  course: Course;
};

export default function LessonCreateModal({
  isOpen,
  onClose,
  onLessonCreated,
  courses,
}: LessonCreateModalProps) {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [chapters, setChapters] = useState<ChapterWithCourse[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    chapterId: "",
    estimatedMinutes: 15,
    orderIndex: 1,
  });

  // モーダルが開かれるたびにフォームをリセット
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        content: "",
        chapterId: "",
        estimatedMinutes: 15,
        orderIndex: 1,
      });
      setError("");
      fetchChapters();
    }
  }, [isOpen]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // チャプター一覧を取得
  const fetchChapters = async () => {
    try {
      const response = await fetch("/api/admin/chapters");
      const data = await response.json();
      if (response.ok) {
        setChapters(data.chapters);
      }
    } catch (error) {
      console.error("チャプター取得エラー:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("レッスン作成完了", `「${formData.title}」を作成しました`);
        onLessonCreated(); // 親コンポーネントに成功を通知
      } else {
        const errorMessage = data.error || "レッスン作成に失敗しました";
        setError(errorMessage);
        showError("レッスン作成失敗", errorMessage);
      }
    } catch (error) {
      const errorMessage = "ネットワークエラーが発生しました";
      setError(errorMessage);
      showError("ネットワークエラー", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "estimatedMinutes" || name === "orderIndex"
          ? parseInt(value) || 0
          : value,
    }));
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
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  新規レッスン作成
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
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
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    レッスン名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例: 変数と型について"
                  />
                </div>

                <div>
                  <label
                    htmlFor="chapterId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    所属チャプター <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="chapterId"
                    name="chapterId"
                    required
                    value={formData.chapterId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">チャプターを選択してください</option>
                    {chapters.map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.course.title} - {chapter.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="estimatedMinutes"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      推定時間（分）
                    </label>
                    <input
                      type="number"
                      id="estimatedMinutes"
                      name="estimatedMinutes"
                      min="1"
                      max="300"
                      value={formData.estimatedMinutes}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="orderIndex"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
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
                </div>

                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    レッスン内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    required
                    rows={8}
                    value={formData.content}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="レッスンの内容をMarkdown形式で入力してください"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    レッスン内容はMarkdown形式で記述できます。コードブロックや画像も使用可能です。
                  </p>
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
                {isLoading ? "作成中..." : "レッスンを作成"}
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
