'use client';

import Link from 'next/link';

interface Lesson {
  id: number;
  title: string;
  orderIndex: number;
  estimatedMinutes?: number | null;
  progress: Array<{
    status: string;
  }>;
}

interface Chapter {
  id: number;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface CourseWithProgress {
  id: number;
  title: string;
  description?: string | null;
  icon: string;
  color: string;
  chapters: Chapter[];
  progressRate: number;
  completedLessons: number;
  lessonCount: number;
  hasProgress: boolean;
}

interface RecommendedLessonsProps {
  coursesWithProgress: CourseWithProgress[];
}

export default function RecommendedLessons({ coursesWithProgress }: RecommendedLessonsProps) {
  // 次に学習すべきレッスンを特定する関数
  const getNextLesson = (course: CourseWithProgress) => {
    for (const chapter of course.chapters.sort((a, b) => a.orderIndex - b.orderIndex)) {
      for (const lesson of chapter.lessons.sort((a, b) => a.orderIndex - b.orderIndex)) {
        // 進行中のレッスンがあればそれを返す
        if (lesson.progress.some(p => p.status === 'IN_PROGRESS')) {
          return { lesson, chapter, status: 'continue' as const };
        }
        // 未開始のレッスンがあればそれを返す
        if (lesson.progress.length === 0) {
          return { lesson, chapter, status: 'start' as const };
        }
      }
    }
    return null;
  };

  // 各コースの次のレッスンを取得
  const recommendations = coursesWithProgress
    .map(course => {
      const nextLesson = getNextLesson(course);
      if (!nextLesson) return null;
      
      return {
        course,
        nextLesson: nextLesson.lesson,
        chapter: nextLesson.chapter,
        status: nextLesson.status,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .slice(0, 3); // 最大3つまで表示

  // 新しいコース推奨（進捗がないコース）
  const availableCourses = coursesWithProgress
    .filter(course => !course.hasProgress)
    .slice(0, 2);

  if (recommendations.length === 0 && availableCourses.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h3 className="text-2xl font-bold text-white mb-6">
        おすすめの学習
      </h3>

      <div className="space-y-6">
        {/* 進行中コースの次のレッスン */}
        {recommendations.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              続きから学習
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map(({ course, nextLesson, chapter, status }) => (
                <Link
                  key={`${course.id}-${nextLesson.id}`}
                  href={`/lessons/${nextLesson.id}`}
                  className="group block"
                >
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-cyan-400/50 transition-all duration-300 group-hover:shadow-sm group-hover:shadow-cyan-400/10 group-hover:-translate-y-1">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`${course.color} w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0`}>
                        {course.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-400 text-xs mb-1 truncate">
                          {course.title} • {chapter.title}
                        </div>
                        <h5 className="text-white font-bold text-sm mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                          {nextLesson.title}
                        </h5>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status === 'continue' 
                            ? 'bg-yellow-600/20 text-yellow-400' 
                            : 'bg-green-600/20 text-green-400'
                        }`}>
                          {status === 'continue' ? '続ける' : '開始'}
                        </span>
                        {nextLesson.estimatedMinutes && (
                          <span className="text-xs text-slate-400">
                            約{nextLesson.estimatedMinutes}分
                          </span>
                        )}
                      </div>
                      <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors text-sm">
                        →
                      </div>
                    </div>

                    {/* 進捗バー */}
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>コース進捗</span>
                        <span>{course.completedLessons}/{course.lessonCount}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                          style={{ width: `${course.progressRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 新しいコース推奨 */}
        {availableCourses.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">🌟</span>
              新しいコースを始める
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group block"
                >
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-cyan-400/50 transition-all duration-300 group-hover:shadow-sm group-hover:shadow-cyan-400/10 group-hover:-translate-y-1">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`${course.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0`}>
                        {course.icon}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-white font-bold text-lg mb-2 group-hover:text-cyan-400 transition-colors">
                          {course.title.includes('(') ? course.title.split('(')[0] : course.title}
                        </h5>
                        <p className="text-slate-300 text-sm line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="bg-slate-700 border border-slate-600 text-cyan-400 px-3 py-1 rounded-full text-sm font-medium">
                        {course.lessonCount}レッスン
                      </div>
                      <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
                        →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}