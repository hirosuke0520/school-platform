'use client';

import { useState } from 'react';
import { useSession } from '@/contexts/SessionContext';

export default function SessionStartModal() {
  const { state, actions } = useSession();
  const [startReason, setStartReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 開始モーダルを表示する条件
  if (!state.showStartModal || state.status !== 'NOT_STARTED' || state.isLoading) {
    return null;
  }

  const handleStart = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await actions.startSession();
      // SessionContextが自動的にモーダルを閉じる
    } catch (error) {
      console.error('セッション開始エラー:', error);
      alert('セッションの開始に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 relative">
        {/* 閉じるボタンなし（強制モーダル） */}
        
        {/* アイコンとタイトル */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl">📚</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            学習を開始しましょう
          </h2>
          <p className="text-gray-600 text-sm">
            学習を始める前に、開始報告を行ってください。<br />
            学習時間を正確に記録するために必要です。
          </p>
        </div>

        {/* 開始理由入力（任意） */}
        <div className="mb-6">
          <label htmlFor="startReason" className="block text-sm font-medium text-gray-700 mb-2">
            今日の学習目標（任意）
          </label>
          <textarea
            id="startReason"
            value={startReason}
            onChange={(e) => setStartReason(e.target.value)}
            placeholder="例：HTMLの基礎を理解する、Git コマンドを覚える..."
            className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            maxLength={200}
            disabled={isSubmitting}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {startReason.length}/200
          </div>
        </div>

        {/* 重要な注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <span className="text-yellow-600 text-lg mr-2">⚠️</span>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">重要</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>学習セッションは24時間以内に終了報告が必要です</li>
                <li>終了時に学習内容の報告が必須となります</li>
                <li>正確な学習時間の記録にご協力ください</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 開始ボタン */}
        <button
          onClick={handleStart}
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 active:scale-95'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              開始中...
            </div>
          ) : (
            '学習を開始する'
          )}
        </button>

        {/* フッター情報 */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            開始後はヘッダーに学習時間が表示されます
          </p>
        </div>
      </div>
    </div>
  );
}