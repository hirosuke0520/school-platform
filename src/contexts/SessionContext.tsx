'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// セッション状態の型定義
export type SessionStatus = 'NOT_STARTED' | 'ACTIVE' | 'PENDING_END' | 'COMPLETED';

export interface SessionState {
  status: SessionStatus;
  currentSession?: {
    id: string;
    startedAt: Date;
  };
  timeElapsed: number; // milliseconds
  showStartModal: boolean;
  showEndModal: boolean;
  isLoading: boolean;
}

export interface SessionActions {
  startSession: (startReport?: string) => Promise<void>;
  endSession: (endTime?: Date, progressReport?: string) => Promise<void>;
  checkSessionStatus: () => Promise<void>;
  dismissModal: (type: 'start' | 'end') => void;
  updateTimeElapsed: (elapsed: number) => void;
  clearSession: () => void;
}

// アクション型定義
type SessionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STATUS'; payload: SessionStatus }
  | { type: 'SET_CURRENT_SESSION'; payload: SessionState['currentSession'] }
  | { type: 'SET_TIME_ELAPSED'; payload: number }
  | { type: 'SHOW_START_MODAL'; payload: boolean }
  | { type: 'SHOW_END_MODAL'; payload: boolean }
  | { type: 'DISMISS_MODAL'; payload: 'start' | 'end' }
  | { type: 'RESET_SESSION' };

// 初期状態
const initialState: SessionState = {
  status: 'NOT_STARTED',
  currentSession: undefined,
  timeElapsed: 0,
  showStartModal: false,
  showEndModal: false,
  isLoading: false,
};

// リデューサー
function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_STATUS':
      return { ...state, status: action.payload };
      
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
      
    case 'SET_TIME_ELAPSED':
      return { ...state, timeElapsed: action.payload };
      
    case 'SHOW_START_MODAL':
      return { ...state, showStartModal: action.payload };
      
    case 'SHOW_END_MODAL':
      return { ...state, showEndModal: action.payload };
      
    case 'DISMISS_MODAL':
      if (action.payload === 'start') {
        return { ...state, showStartModal: false };
      } else {
        return { ...state, showEndModal: false };
      }
      
    case 'RESET_SESSION':
      return {
        ...initialState,
        status: 'COMPLETED',
      };
      
    default:
      return state;
  }
}

// Context作成
const SessionContext = createContext<{
  state: SessionState;
  actions: SessionActions;
} | null>(null);

// LocalStorage キー
const STORAGE_KEY = 'learningSession';

// Provider コンポーネント
export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  // LocalStorage からセッション状態を復元
  const loadSessionFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.currentSession) {
          dispatch({ type: 'SET_CURRENT_SESSION', payload: {
            ...parsed.currentSession,
            startedAt: new Date(parsed.currentSession.startedAt)
          }});
          dispatch({ type: 'SET_STATUS', payload: 'ACTIVE' });
        }
      }
    } catch (error) {
      console.error('セッション状態の復元に失敗:', error);
    }
  };

  // LocalStorage にセッション状態を保存
  const saveSessionToStorage = (session: SessionState['currentSession']) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentSession: session }));
    } catch (error) {
      console.error('セッション状態の保存に失敗:', error);
    }
  };

  // セッション状態をクリア
  const clearSessionFromStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('セッション状態のクリアに失敗:', error);
    }
  };

  // セッション開始
  const startSession = async (startReport?: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startReport }),
      });

      if (!response.ok) {
        throw new Error('セッション開始に失敗しました');
      }

      const data = await response.json();
      const sessionData = {
        id: data.sessionId,
        startedAt: new Date(data.startedAt),
      };

      dispatch({ type: 'SET_CURRENT_SESSION', payload: sessionData });
      dispatch({ type: 'SET_STATUS', payload: 'ACTIVE' });
      dispatch({ type: 'SHOW_START_MODAL', payload: false });
      
      saveSessionToStorage(sessionData);

    } catch (error) {
      console.error('セッション開始エラー:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // セッション終了
  const endSession = async (endTime?: Date, progressReport?: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (!state.currentSession) {
        throw new Error('アクティブなセッションがありません');
      }

      const response = await fetch('/api/session/end', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.currentSession.id,
          endTime: endTime || new Date(),
          progressReport,
        }),
      });

      if (!response.ok) {
        throw new Error('セッション終了に失敗しました');
      }

      dispatch({ type: 'RESET_SESSION' });
      clearSessionFromStorage();

    } catch (error) {
      console.error('セッション終了エラー:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // セッション状態チェック
  const checkSessionStatus = async (): Promise<void> => {
    try {
      const response = await fetch('/api/session/status');
      if (!response.ok) return;

      const data = await response.json();
      
      if (data.currentSession) {
        const sessionData = {
          id: data.currentSession.id,
          startedAt: new Date(data.currentSession.startedAt),
        };

        dispatch({ type: 'SET_CURRENT_SESSION', payload: sessionData });
        dispatch({ type: 'SET_STATUS', payload: 'ACTIVE' });
        
        // 24時間経過チェック
        const now = new Date().getTime();
        const elapsed = now - sessionData.startedAt.getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (elapsed >= twentyFourHours) {
          dispatch({ type: 'SET_STATUS', payload: 'PENDING_END' });
          dispatch({ type: 'SHOW_END_MODAL', payload: true });
        }
        
        saveSessionToStorage(sessionData);
      } else {
        dispatch({ type: 'SET_STATUS', payload: 'NOT_STARTED' });
        dispatch({ type: 'SHOW_START_MODAL', payload: true });
      }

    } catch (error) {
      console.error('セッション状態チェックエラー:', error);
    }
  };

  // モーダル閉じる
  const dismissModal = (type: 'start' | 'end'): void => {
    dispatch({ type: 'DISMISS_MODAL', payload: type });
  };

  // 経過時間更新
  const updateTimeElapsed = (elapsed: number): void => {
    dispatch({ type: 'SET_TIME_ELAPSED', payload: elapsed });
    
    // 24時間経過チェック
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (elapsed >= twentyFourHours && state.status === 'ACTIVE') {
      dispatch({ type: 'SET_STATUS', payload: 'PENDING_END' });
      dispatch({ type: 'SHOW_END_MODAL', payload: true });
    }
  };

  // セッション情報をクリア（開発用）
  const clearSession = (): void => {
    dispatch({ type: 'RESET_SESSION' });
    clearSessionFromStorage();
    dispatch({ type: 'SET_STATUS', payload: 'NOT_STARTED' });
  };

  // 初期化時にLocalStorageから復元とサーバー状態チェック
  useEffect(() => {
    loadSessionFromStorage();
    checkSessionStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actions: SessionActions = {
    startSession,
    endSession,
    checkSessionStatus,
    dismissModal,
    updateTimeElapsed,
    clearSession,
  };

  return (
    <SessionContext.Provider value={{ state, actions }}>
      {children}
    </SessionContext.Provider>
  );
}

// Hook
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession は SessionProvider 内で使用してください');
  }
  return context;
}