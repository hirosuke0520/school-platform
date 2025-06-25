'use client';

import { useEffect } from 'react';
import { useSession as useNextAuthSession } from 'next-auth/react';
import { useSession } from '@/contexts/SessionContext';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import SessionStartModal from '@/components/modals/SessionStartModal';
import SessionEndModal from '@/components/modals/SessionEndModal';

export default function SessionManager() {
  const { data: authSession, status } = useNextAuthSession();
  const { state, actions } = useSession();
  const { isActive, isOverLimit } = useSessionTimer();

  // セッション状態を定期的にチェック（アクティブな時のみ）
  useEffect(() => {
    if (state.status !== 'ACTIVE') {
      return; // アクティブでない場合は定期チェックしない
    }
    
    const checkInterval = setInterval(() => {
      // セッション状態を再確認（サーバーとの同期）
      actions.checkSessionStatus();
    }, 5 * 60 * 1000); // 5分間隔

    return () => clearInterval(checkInterval);
  }, [actions, state.status]);

  // 24時間経過時の自動モーダル表示
  useEffect(() => {
    if (isActive && isOverLimit && !state.showEndModal) {
      // 24時間を超過したが、まだ終了モーダルが表示されていない場合
      actions.checkSessionStatus();
    }
  }, [isActive, isOverLimit, state.showEndModal, actions]);

  // ページ離脱時の警告（学習中のみ）
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isActive) {
        e.preventDefault();
        e.returnValue = '学習セッションが進行中です。ページを離れると学習時間の記録が中断される可能性があります。';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isActive]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + E で終了モーダルを表示（学習中のみ）
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && isActive && !state.showEndModal) {
        e.preventDefault();
        actions.dismissModal('start'); // 開始モーダルがあれば閉じる
        // 手動で終了モーダルを表示
        // これは今後のアップデートで実装予定
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, state.showEndModal, actions]);

  // E2Eテスト中、認証されていない場合、またはLEARNER以外は何も表示しない
  if (process.env.NODE_ENV === 'test' || 
      process.env.PLAYWRIGHT_TEST || 
      status === 'loading' || 
      !authSession?.user ||
      authSession.user.role !== 'LEARNER') {
    return null;
  }

  return (
    <>
      {/* 開始モーダル */}
      <SessionStartModal />
      
      {/* 終了モーダル */}
      <SessionEndModal />
      
      {/* デバッグ情報（開発時のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-40">
          <div>Status: {state.status}</div>
          <div>Session: {state.currentSession?.id || 'None'}</div>
          <div>Start Modal: {state.showStartModal ? 'Visible' : 'Hidden'}</div>
          <div>End Modal: {state.showEndModal ? 'Visible' : 'Hidden'}</div>
          <div>Active: {isActive ? 'Yes' : 'No'}</div>
          <div>Over Limit: {isOverLimit ? 'Yes' : 'No'}</div>
        </div>
      )}
    </>
  );
}