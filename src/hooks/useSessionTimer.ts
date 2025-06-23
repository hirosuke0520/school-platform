'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from '@/contexts/SessionContext';

export function useSessionTimer() {
  const { state, actions } = useSession();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  // 経過時間を計算
  const calculateElapsed = useCallback(() => {
    if (!state.currentSession) return 0;
    const now = Date.now();
    const startTime = state.currentSession.startedAt.getTime();
    return now - startTime;
  }, [state.currentSession]);

  // タイマー開始
  const startTimer = useCallback(() => {
    if (intervalRef.current) return; // 既に開始している場合は何もしない

    intervalRef.current = setInterval(() => {
      const elapsed = calculateElapsed();
      actions.updateTimeElapsed(elapsed);
      lastUpdateRef.current = Date.now();
    }, 1000); // 1秒間隔

  }, [calculateElapsed, actions]);

  // タイマー停止
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // タイマーリセット
  const resetTimer = useCallback(() => {
    stopTimer();
    actions.updateTimeElapsed(0);
    lastUpdateRef.current = Date.now();
  }, [stopTimer, actions]);

  // セッション状態の変化に応じてタイマーを制御
  useEffect(() => {
    if (state.status === 'ACTIVE' && state.currentSession) {
      // アクティブセッションがある場合、タイマーを開始
      startTimer();
      
      // 初期経過時間を設定
      const initialElapsed = calculateElapsed();
      actions.updateTimeElapsed(initialElapsed);
      
    } else {
      // セッションがない場合、タイマーを停止
      stopTimer();
    }

    // クリーンアップ
    return () => {
      stopTimer();
    };
  }, [state.status, state.currentSession, startTimer, stopTimer, calculateElapsed, actions]);

  // ページの可視性変化を監視（バックグラウンド時の時間補正）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.status === 'ACTIVE') {
        // ページが再表示された時、経過時間を再計算
        const elapsed = calculateElapsed();
        actions.updateTimeElapsed(elapsed);
        
        // タイマーを再開（念のため）
        if (!intervalRef.current) {
          startTimer();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.status, calculateElapsed, actions, startTimer]);

  // ページアンロード時の処理
  useEffect(() => {
    const handleBeforeUnload = () => {
      // LocalStorageに最新の経過時間を保存
      if (state.currentSession) {
        const elapsed = calculateElapsed();
        localStorage.setItem('sessionTimeElapsed', elapsed.toString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.currentSession, calculateElapsed]);

  // フォーマット関数
  const formatTime = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }, []);

  // 24時間に近づいているかチェック
  const isNearingLimit = useCallback((milliseconds: number): boolean => {
    const twentyThreeHours = 23 * 60 * 60 * 1000; // 23時間
    return milliseconds >= twentyThreeHours;
  }, []);

  // 24時間を超過しているかチェック
  const isOverLimit = useCallback((milliseconds: number): boolean => {
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24時間
    return milliseconds >= twentyFourHours;
  }, []);

  return {
    // 現在の経過時間（ミリ秒）
    timeElapsed: state.timeElapsed,
    
    // フォーマットされた時間文字列
    formattedTime: formatTime(state.timeElapsed),
    
    // タイマー制御
    startTimer,
    stopTimer,
    resetTimer,
    
    // 状態チェック
    isNearingLimit: isNearingLimit(state.timeElapsed),
    isOverLimit: isOverLimit(state.timeElapsed),
    
    // セッション情報
    isActive: state.status === 'ACTIVE',
    sessionId: state.currentSession?.id,
    startedAt: state.currentSession?.startedAt,
    
    // ユーティリティ
    formatTime,
  };
}