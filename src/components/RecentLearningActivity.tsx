'use client';

import Link from 'next/link';

interface LearningSession {
  id: string;
  startedAt: Date;
  endedAt: Date | null;
  progressReport: string | null;
  lesson: {
    id: number;
    title: string;
    chapter: {
      title: string;
      course: {
        id: number;
        title: string;
      };
    };
  };
}

interface RecentLearningActivityProps {
  recentSessions: LearningSession[];
}

export default function RecentLearningActivity({ recentSessions }: RecentLearningActivityProps) {
  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '今日';
    } else if (diffDays === 2) {
      return '昨日';
    } else if (diffDays <= 7) {
      return `${diffDays - 1}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    }
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (recentSessions.length === 0) {
    return (
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-white mb-6">
          最近の学習活動
        </h3>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <div className="text-slate-400 text-4xl mb-4">📚</div>
          <h4 className="text-white text-xl font-bold mb-2">学習記録がありません</h4>
          <p className="text-slate-400 mb-6">
            レッスンを完了すると、ここに学習履歴が表示されます。
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
          >
            学習を始める
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">
          最近の学習活動
        </h3>
        <div className="text-slate-400 text-sm">
          直近{recentSessions.length}セッション
        </div>
      </div>

      <div className="space-y-4">
        {recentSessions.slice(0, 3).map((session) => {
          const duration = session.endedAt 
            ? new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()
            : null;

          return (
            <div 
              key={session.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-cyan-400 text-sm font-medium">
                      {formatDate(new Date(session.startedAt))}
                    </div>
                    <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                    <div className="text-slate-400 text-sm">
                      {session.lesson.chapter.course.title}
                    </div>
                  </div>
                  
                  <h4 className="text-white font-bold text-lg mb-2">
                    {session.lesson.title}
                  </h4>
                  
                  {session.progressReport && (
                    <div className="bg-slate-700/50 rounded-lg p-3 mb-3">
                      <div className="text-slate-300 text-sm">
                        💭 {truncateText(session.progressReport)}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <div className="flex items-center space-x-1">
                      <span>🕒</span>
                      <span>
                        {new Date(session.startedAt).toLocaleTimeString('ja-JP', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {session.endedAt && (
                          <> - {new Date(session.endedAt).toLocaleTimeString('ja-JP', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</>
                        )}
                      </span>
                    </div>
                    {duration && (
                      <>
                        <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                        <div className="flex items-center space-x-1">
                          <span>⏱️</span>
                          <span>{formatDuration(duration)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <Link
                  href={`/lessons/${session.lesson.id}`}
                  className="ml-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                >
                  復習する
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      
      {recentSessions.length > 3 && (
        <div className="mt-6 text-center">
          <Link
            href="/progress"
            className="inline-flex items-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            すべての学習履歴を見る ({recentSessions.length}セッション)
          </Link>
        </div>
      )}
    </section>
  );
}