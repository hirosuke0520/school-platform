'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { useSessionTimer } from '@/hooks/useSessionTimer';

export default function SessionEndModal() {
  const { state, actions } = useSession();
  const { formattedTime } = useSessionTimer();
  
  const [progressReport, setProgressReport] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExtendOption, setShowExtendOption] = useState(false);

  // 終了モーダルを表示する条件
  const shouldShow = state.showEndModal && 
    (state.status === 'PENDING_END' || state.status === 'ACTIVE') && 
    state.currentSession;

  // 初期値設定
  useEffect(() => {
    if (shouldShow && state.currentSession) {
      // 現在時刻を初期値として設定
      const now = new Date();
      const formattedDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setEndTime(formattedDateTime);
    }
  }, [shouldShow, state.currentSession]);

  if (!shouldShow) {
    return null;
  }

  const is24HoursPassed = state.status === 'PENDING_END';
  const startTime = state.currentSession!.startedAt;

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // バリデーション
    if (!progressReport.trim()) {
      alert('進捗報告を入力してください。');
      return;
    }

    if (progressReport.trim().length < 20) {
      alert('進捗報告は20文字以上で入力してください。');
      return;
    }

    if (!endTime) {
      alert('終了時刻を入力してください。');
      return;
    }

    const endDateTime = new Date(endTime);
    if (endDateTime < startTime) {
      alert('終了時刻は開始時刻より後である必要があります。');
      return;
    }

    setIsSubmitting(true);
    try {
      await actions.endSession(endDateTime, progressReport.trim());
      // SessionContextが自動的にモーダルを閉じて状態をリセット
    } catch (error) {
      console.error('セッション終了エラー:', error);
      alert('セッションの終了処理中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExtend = () => {
    // 1時間延長（一時的な延期）
    actions.dismissModal('end');
    setShowExtendOption(false);
    alert('1時間延長されました。引き続き学習を頑張ってください！');
  };

  const handleDismiss = () => {
    if (is24HoursPassed) {
      // 24時間経過の場合は延長オプションを表示
      setShowExtendOption(true);
    } else {
      // 通常の場合はモーダルを閉じる
      actions.dismissModal('end');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6 relative max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            is24HoursPassed 
              ? 'bg-gradient-to-br from-red-500 to-orange-600' 
              : 'bg-gradient-to-br from-green-500 to-blue-600'
          }`}>
            <span className="text-white text-2xl">
              {is24HoursPassed ? '⏰' : '🎓'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {is24HoursPassed ? '学習セッションの終了が必要です' : '学習を終了しますか？'}
          </h2>
          <p className="text-gray-600 text-sm">
            {is24HoursPassed 
              ? '24時間が経過しました。学習の成果を報告してセッションを終了してください。'
              : '学習お疲れ様でした！今日の学習内容を報告してください。'
            }
          </p>
        </div>

        {/* 学習時間表示 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">開始時刻</p>
              <p className="text-lg font-bold text-gray-900">
                {startTime.toLocaleString('ja-JP', { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">経過時間</p>
              <p className={`text-lg font-bold ${
                is24HoursPassed ? 'text-red-600' : 'text-green-600'
              }`}>
                {formattedTime}
              </p>
            </div>
          </div>
        </div>

        {/* 終了時刻編集 */}
        <div className="mb-6">
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
            終了時刻 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            報告が遅れた場合は、実際の終了時刻に修正してください
          </p>
        </div>

        {/* 進捗報告入力 */}
        <div className="mb-6">
          <label htmlFor="progressReport" className="block text-sm font-medium text-gray-700 mb-2">
            今日の学習内容・進捗報告 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="progressReport"
            value={progressReport}
            onChange={(e) => setProgressReport(e.target.value)}
            placeholder="例：HTMLの基本タグを学習し、簡単なページを作成しました。特にheaderとfooterの使い方が理解できました。明日はCSSのレイアウトについて学習予定です。"
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            maxLength={2000}
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-1">
            <p className={`text-xs ${
              progressReport.length < 20 ? 'text-red-500' : 'text-gray-500'
            }`}>
              最小20文字必要
            </p>
            <p className="text-xs text-gray-500">
              {progressReport.length}/2000
            </p>
          </div>
        </div>

        {/* 延長オプション（24時間経過時のみ） */}
        {showExtendOption && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-yellow-600 text-lg mr-2">⏳</span>
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-2">
                  もう少し学習を続けますか？
                </p>
                <p className="text-yellow-700 mb-3">
                  1時間延長して学習を続けることができます。ただし、長時間の学習は疲労につながる可能性があります。
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleExtend}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                  >
                    1時間延長
                  </button>
                  <button
                    onClick={() => setShowExtendOption(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ボタン */}
        <div className="flex space-x-3">
          {!is24HoursPassed && !showExtendOption && (
            <button
              onClick={handleDismiss}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              後で終了
            </button>
          )}
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || progressReport.trim().length < 20}
            className={`${!is24HoursPassed && !showExtendOption ? 'flex-1' : 'w-full'} py-3 px-4 rounded-lg font-semibold text-white transition-all ${
              isSubmitting || progressReport.trim().length < 20
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 hover:scale-105 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                終了処理中...
              </div>
            ) : (
              '学習を終了する'
            )}
          </button>
        </div>

        {/* フッター情報 */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            終了後はダッシュボードで学習履歴を確認できます
          </p>
        </div>
      </div>
    </div>
  );
}