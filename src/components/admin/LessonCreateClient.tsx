'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Course, Chapter } from '@prisma/client';
import { useToast } from '@/contexts/ToastContext';
import LessonPublishModal from './LessonPublishModal';

// MDEditor を動的インポート（SSR 回避）
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface LessonCreateClientProps {
  course: Course;
  chapters: Chapter[];
}

export default function LessonCreateClient({ course, chapters }: LessonCreateClientProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [lessonId, setLessonId] = useState<number | null>(null); // レッスンIDを管理
  const [isEditMode, setIsEditMode] = useState(false); // 編集モードフラグ
  const [formData, setFormData] = useState({
    title: '',
    chapterId: chapters.length > 0 ? chapters[0].id : '',
    orderIndex: 1,
    estimatedMinutes: 30,
  });
  const [content, setContent] = useState('# レッスンタイトル\n\nここにレッスンの内容を書いてください。\n\n## セクション1\n\n内容...\n\n```javascript\nconsole.log("Hello, World!");\n```\n\n## セクション2\n\n内容...');
  const editorRef = useRef<HTMLDivElement>(null);

  // ツールバーアイコンの日本語ツールチップを追加
  useEffect(() => {
    const addTooltips = () => {
      if (editorRef.current) {
        const toolbarButtons = editorRef.current.querySelectorAll('.w-md-editor-toolbar button');
        
        const tooltipMap: { [key: string]: string } = {
          'bold': '太字 (Ctrl+B)',
          'italic': '斜体 (Ctrl+I)',
          'header': '見出し',
          'strike': '取り消し線',
          'unordered-list': '箇条書きリスト',
          'ordered-list': '番号付きリスト',
          'checked-list': 'チェックリスト',
          'quote': '引用',
          'hr': '水平線',
          'code': 'インラインコード',
          'codeBlock': 'コードブロック',
          'table': 'テーブル',
          'link': 'リンク (Ctrl+K)',
          'image': '画像',
          'fullscreen': 'フルスクリーン',
          'preview': 'プレビュー',
          'edit': '編集',
          'live': 'ライブプレビュー'
        };

        toolbarButtons.forEach((button) => {
          const element = button as HTMLElement;
          const ariaLabel = element.getAttribute('aria-label') || '';
          const dataName = element.getAttribute('data-name') || '';
          const title = element.getAttribute('title') || '';
          
          // アイコンのタイプを特定
          let tooltipText = '';
          
          if (ariaLabel.includes('bold') || dataName.includes('bold') || title.includes('bold')) {
            tooltipText = tooltipMap['bold'];
          } else if (ariaLabel.includes('italic') || dataName.includes('italic') || title.includes('italic')) {
            tooltipText = tooltipMap['italic'];
          } else if (ariaLabel.includes('header') || dataName.includes('header') || title.includes('header')) {
            tooltipText = tooltipMap['header'];
          } else if (ariaLabel.includes('strike') || dataName.includes('strike') || title.includes('strike')) {
            tooltipText = tooltipMap['strike'];
          } else if (ariaLabel.includes('unordered') || dataName.includes('unordered') || title.includes('unordered')) {
            tooltipText = tooltipMap['unordered-list'];
          } else if (ariaLabel.includes('ordered') || dataName.includes('ordered') || title.includes('ordered')) {
            tooltipText = tooltipMap['ordered-list'];
          } else if (ariaLabel.includes('checked') || dataName.includes('checked') || title.includes('checked')) {
            tooltipText = tooltipMap['checked-list'];
          } else if (ariaLabel.includes('quote') || dataName.includes('quote') || title.includes('quote')) {
            tooltipText = tooltipMap['quote'];
          } else if (ariaLabel.includes('hr') || dataName.includes('hr') || title.includes('hr')) {
            tooltipText = tooltipMap['hr'];
          } else if (ariaLabel.includes('code') && !ariaLabel.includes('codeBlock') || dataName.includes('code') && !dataName.includes('codeBlock')) {
            tooltipText = tooltipMap['code'];
          } else if (ariaLabel.includes('codeBlock') || dataName.includes('codeBlock') || title.includes('codeBlock')) {
            tooltipText = tooltipMap['codeBlock'];
          } else if (ariaLabel.includes('table') || dataName.includes('table') || title.includes('table')) {
            tooltipText = tooltipMap['table'];
          } else if (ariaLabel.includes('link') || dataName.includes('link') || title.includes('link')) {
            tooltipText = tooltipMap['link'];
          } else if (ariaLabel.includes('image') || dataName.includes('image') || title.includes('image')) {
            tooltipText = tooltipMap['image'];
          } else if (ariaLabel.includes('fullscreen') || dataName.includes('fullscreen') || title.includes('fullscreen')) {
            tooltipText = tooltipMap['fullscreen'];
          } else if (ariaLabel.includes('preview') || dataName.includes('preview') || title.includes('preview')) {
            tooltipText = tooltipMap['preview'];
          } else if (ariaLabel.includes('edit') || dataName.includes('edit') || title.includes('edit')) {
            tooltipText = tooltipMap['edit'];
          } else if (ariaLabel.includes('live') || dataName.includes('live') || title.includes('live')) {
            tooltipText = tooltipMap['live'];
          }

          // SVGアイコンから推測する場合
          if (!tooltipText) {
            const svg = element.querySelector('svg');
            if (svg) {
              const pathData = svg.querySelector('path')?.getAttribute('d') || '';
              
              // 各アイコンの特徴的なpath dataで判定
              if (pathData.includes('M6 2a1 1 0 0 0-1 1v1H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1V3a1 1 0 0 0-1-1H6Z')) {
                tooltipText = '見出し';
              } else if (pathData.includes('font-weight') || element.innerHTML.includes('B')) {
                tooltipText = tooltipMap['bold'];
              } else if (pathData.includes('font-style') || element.innerHTML.includes('I')) {
                tooltipText = tooltipMap['italic'];
              }
            }
          }

          if (tooltipText) {
            element.setAttribute('data-tooltip', tooltipText);
            element.setAttribute('title', ''); // デフォルトのtitleを削除
          }
        });
      }
    };

    // エディターが読み込まれた後にツールチップを追加
    const timer = setTimeout(addTooltips, 500);
    
    // 定期的に再実行（エディターの再描画に対応）
    const interval = setInterval(addTooltips, 2000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // 下書き保存
  const handleSaveDraft = async () => {
    setIsDraftSaving(true);

    try {
      const url = isEditMode && lessonId 
        ? `/api/admin/lessons/${lessonId}` 
        : '/api/admin/lessons';
      const method = isEditMode && lessonId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          content,
          chapterId: parseInt(formData.chapterId),
          isPublished: false,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 初回保存の場合、編集モードに切り替え
        if (!isEditMode) {
          setLessonId(data.lesson.id);
          setIsEditMode(true);
        }
        showSuccess('下書き保存完了', `「${formData.title}」を下書きとして保存しました`);
      } else {
        const errorMessage = data.error || '下書き保存に失敗しました';
        showError('下書き保存失敗', errorMessage);
      }
    } catch (error) {
      showError('ネットワークエラー', 'ネットワークエラーが発生しました');
    } finally {
      setIsDraftSaving(false);
    }
  };

  // 公開
  const handlePublish = async () => {
    setIsLoading(true);

    try {
      const url = isEditMode && lessonId 
        ? `/api/admin/lessons/${lessonId}` 
        : '/api/admin/lessons';
      const method = isEditMode && lessonId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          content,
          chapterId: parseInt(formData.chapterId),
          isPublished: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 初回保存の場合、編集モードに切り替え
        if (!isEditMode) {
          setLessonId(data.lesson.id);
          setIsEditMode(true);
        }
        // 公開成功後は画面遷移せずにそのまま編集継続
      } else {
        const errorMessage = data.error || 'レッスン公開に失敗しました';
        showError('レッスン公開失敗', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      showError('ネットワークエラー', 'ネットワークエラーが発生しました');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'orderIndex' || name === 'estimatedMinutes' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/admin/courses/${course.id}`}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                コース詳細に戻る
              </Link>
              <div className="text-gray-300">|</div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">新規レッスン作成</h1>
                <p className="text-sm text-gray-500">{course.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isDraftSaving}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                {isDraftSaving ? '保存中...' : '下書き保存'}
              </button>
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(true)}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                {isLoading ? '公開中...' : '公開'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* レッスン設定（上部） */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                レッスンタイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: JavaScript基礎"
              />
            </div>

            <div>
              <label htmlFor="chapterId" className="block text-sm font-medium text-gray-700 mb-1">
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
                <option value="">チャプターを選択</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.orderIndex}. {chapter.title}
                  </option>
                ))}
              </select>
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

            <div>
              <label htmlFor="estimatedMinutes" className="block text-sm font-medium text-gray-700 mb-1">
                推定学習時間（分）
              </label>
              <input
                type="number"
                id="estimatedMinutes"
                name="estimatedMinutes"
                min="1"
                value={formData.estimatedMinutes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ（マークダウンエディタ） */}
      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg border shadow-sm h-full">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">レッスンコンテンツ</h2>
              <p className="text-sm text-gray-500 mt-1">
                マークダウンでレッスンの内容を記述してください。右側でリアルタイムプレビューが確認できます。
              </p>
            </div>
            <div className="p-4" ref={editorRef}>
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || '')}
                preview="live"
                hideToolbar={false}
                visibleDragBar={false}
                textareaProps={{
                  placeholder: 'ここにマークダウンでレッスン内容を入力してください...',
                  style: {
                    fontSize: 14,
                    lineHeight: 1.5,
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                  },
                }}
                height={700}
                data-color-mode="light"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 公開確認モーダル */}
      <LessonPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={handlePublish}
        lessonTitle={formData.title}
      />
    </div>
  );
}