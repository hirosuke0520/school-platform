'use client';

interface PersonalProgressStatsProps {
  totalCompleted: number;
  totalInProgress: number;
  totalLearningTime: number;
  hasLearningToday: boolean;
}

export default function PersonalProgressStats({
  totalCompleted,
  totalInProgress,
  totalLearningTime,
  hasLearningToday
}: PersonalProgressStatsProps) {
  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">
          あなたの学習状況
        </h3>
        {hasLearningToday && (
          <div className="flex items-center space-x-2 bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm">
            <span>🔥</span>
            <span>今日も学習中！</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 完了済みレッスン */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{totalCompleted}</div>
              <div className="text-green-100 text-sm">完了</div>
            </div>
          </div>
          <div className="text-green-100 text-sm">
            レッスン完了数
          </div>
        </div>

        {/* 進行中レッスン */}
        <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{totalInProgress}</div>
              <div className="text-yellow-100 text-sm">進行中</div>
            </div>
          </div>
          <div className="text-yellow-100 text-sm">
            学習中のレッスン
          </div>
        </div>

        {/* 総学習時間 */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <span className="text-2xl">🕒</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {totalLearningTime > 0 ? formatDuration(totalLearningTime) : '0分'}
              </div>
              <div className="text-purple-100 text-sm">学習時間</div>
            </div>
          </div>
          <div className="text-purple-100 text-sm">
            累計学習時間
          </div>
        </div>

        {/* 学習ストリーク */}
        <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <span className="text-2xl">{hasLearningToday ? '🔥' : '💪'}</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {hasLearningToday ? '1' : '0'}
              </div>
              <div className="text-cyan-100 text-sm">日連続</div>
            </div>
          </div>
          <div className="text-cyan-100 text-sm">
            学習ストリーク
          </div>
        </div>
      </div>
    </section>
  );
}