'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LessonCompletionProps {
  lessonId: number;
  isCompleted?: boolean;
  initialProgressReport?: string;
}

export default function LessonCompletion({ 
  lessonId, 
  isCompleted = false,
  initialProgressReport = ''
}: LessonCompletionProps) {
  const [progressReport, setProgressReport] = useState(initialProgressReport);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const router = useRouter();

  const handleStartSession = async () => {
    try {
      const response = await fetch(`/api/progress/${lessonId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('学習セッションの開始に失敗しました');
      }

      // 学習セッション開始の成功通知は控えめに
      console.log('学習セッションを開始しました');
    } catch (error) {
      console.error('学習セッション開始エラー:', error);
      // エラーは表示しない（学習体験を妨げないため）
    }
  };

  const handleComplete = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 楽観的更新
      setCompleted(true);

      const response = await fetch(`/api/progress/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progressReport: progressReport.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error('レッスンの完了処理に失敗しました');
      }

      await response.json();
      
      // 成功通知
      setTimeout(() => {
        alert('🎉 レッスンを完了しました！お疲れ様でした。');
      }, 500);

      // ページを更新して最新状態を反映
      router.refresh();

    } catch (error) {
      console.error('レッスン完了エラー:', error);
      // 楽観的更新を戻す
      setCompleted(isCompleted);
      alert('レッスンの完了処理中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ページ読み込み時に学習セッションを自動開始
  useState(() => {
    if (!completed) {
      handleStartSession();
    }
  });

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">
            {completed ? '✅ レッスン完了' : '📚 レッスンの進捗'}
          </h3>
          
          {completed ? (
            <p className="text-green-400 text-sm mb-4">
              このレッスンは完了済みです。お疲れ様でした！
            </p>
          ) : (
            <p className="text-slate-400 text-sm mb-4">
              学習を終えたら、下のボタンをクリックして完了してください。
            </p>
          )}

          {/* 進捗報告入力フォーム */}
          <div className="space-y-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              {isExpanded ? '📝 進捗報告を閉じる' : '📝 進捗報告を書く（任意）'}
            </button>
            
            {isExpanded && (
              <div className="space-y-3">
                <textarea
                  value={progressReport}
                  onChange={(e) => setProgressReport(e.target.value)}
                  placeholder="今日の学習で学んだこと、感想、次回への課題などを自由に記入してください..."
                  className="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  maxLength={2000}
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>学習の振り返りや感想を記録しておくと、後で見返すことができます</span>
                  <span>{progressReport.length}/2000</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="ml-6">
          {completed ? (
            <div className="flex items-center space-x-2 bg-green-600/20 text-green-400 px-4 py-2 rounded-lg">
              <span>✓</span>
              <span className="font-semibold">完了済み</span>
            </div>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                isSubmitting
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  <span>処理中...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>完了する</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}