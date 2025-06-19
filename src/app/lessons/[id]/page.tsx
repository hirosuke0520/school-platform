import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/20/solid";
import Breadcrumb from "../../../components/Breadcrumb";

// モックデータ - 実際の実装ではAPIから取得
const lessonData = {
  1: {
    id: 1,
    title: "URLを分解して見てみよう",
    course: { id: 1, title: "PHPを理解する" },
    chapter: { id: 1, title: "URLをパーツに分けて理解する" },
    content: `
# URLを分解して見てみよう

URLは以下の要素から構成されています：

## 1. プロトコル
- **http://** または **https://**
- データの転送方法を指定

## 2. ドメイン名
- **example.com** のような部分
- サーバーの場所を特定

## 3. パス
- **/path/to/page** のような部分
- サーバー内の具体的なリソースを指定

## 4. クエリパラメータ
- **?key=value&key2=value2** のような部分
- サーバーに追加情報を送信

## 実例
\`\`\`
https://example.com/courses/php?lesson=1&page=2
\`\`\`

- プロトコル: https://
- ドメイン: example.com
- パス: /courses/php
- クエリ: ?lesson=1&page=2
    `,
    prevLesson: null,
    nextLesson: { id: 2, title: "リクエストとレスポンス" },
  },
  2: {
    id: 2,
    title: "リクエストとレスポンス",
    course: { id: 1, title: "PHPを理解する" },
    chapter: { id: 2, title: "リクエストとレスポンス" },
    content: `
# リクエストとレスポンス

Webアプリケーションは「リクエスト」と「レスポンス」の仕組みで動作します。

## リクエスト（Request）
クライアント（ブラウザ）からサーバーへの要求

### 主な要素
- **HTTPメソッド**: GET, POST, PUT, DELETE など
- **URL**: アクセス先のアドレス
- **ヘッダー**: 追加の情報
- **ボディ**: データ（POSTの場合など）

## レスポンス（Response）
サーバーからクライアントへの応答

### 主な要素
- **ステータスコード**: 200（成功）, 404（見つからない）など
- **ヘッダー**: レスポンスの情報
- **ボディ**: 実際のコンテンツ（HTML、JSON など）

## フロー例
1. ブラウザが \`GET /users\` をリクエスト
2. サーバーがユーザー一覧を取得
3. HTML形式でレスポンスを返す
4. ブラウザがHTMLを表示
    `,
    prevLesson: { id: 1, title: "URLを分解して見てみよう" },
    nextLesson: { id: 3, title: "Webサーバーについて" },
  },
  7: {
    id: 7,
    title: "PHPとは？",
    course: { id: 1, title: "PHPを理解する" },
    chapter: { id: 7, title: "プログラミング言語について" },
    content: `
# PHPとは？

PHPは **Web開発に特化したサーバーサイド プログラミング言語** です。

## PHPの特徴

### 1. サーバーサイド言語
- サーバー上で実行される
- ブラウザには結果（HTML）のみが送信される
- データベースとの連携が得意

### 2. 習得しやすい
- 文法がシンプル
- エラーメッセージが分かりやすい
- 豊富な学習リソース

### 3. 豊富なフレームワーク
- **Laravel**: 最も人気の高いPHPフレームワーク
- **Symfony**: 企業向けの高機能フレームワーク
- **CodeIgniter**: 軽量で学習しやすい

## PHPでできること

- **Webサイト構築**: WordPress, 企業サイトなど
- **Webアプリケーション**: ECサイト, SNS, 管理システム
- **API開発**: モバイルアプリのバックエンド
- **バッチ処理**: データ処理, 定期実行タスク

## コード例
\`\`\`php
<?php
echo "Hello, World!";

$name = "太郎";
echo "こんにちは、" . $name . "さん";
?>
\`\`\`
    `,
    prevLesson: { id: 6, title: "バックエンドとは" },
    nextLesson: { id: 8, title: "PHPファイルを作成して表示してみよう" },
  },
};

export default function LessonDetail({ params }: { params: { id: string } }) {
  const lessonId = parseInt(params.id);
  const lesson = lessonData[lessonId as keyof typeof lessonData];

  if (!lesson) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            レッスンが見つかりません
          </h1>
          <Link
            href="/"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { name: lesson.course.title, href: `/courses/${lesson.course.id}` },
    { name: lesson.chapter.title },
    { name: lesson.title },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xs border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/courses/${lesson.course.id}`}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </Link>
              <div className="relative">
                <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-sm">
                  <div className="w-6 h-6 border-2 border-white rounded-xs transform rotate-12"></div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">Code Strategy</h1>
                <p className="text-slate-400 text-xs">
                  プログラミング学習プラットフォーム
                </p>
              </div>
            </div>
            <div className="w-10 h-10 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-transform">
              <span className="text-slate-800 text-xs font-bold">検証</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Lesson Header */}
        <div className="bg-linear-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{lesson.title}</h1>
          <p className="text-slate-400 text-sm">
            {lesson.course.title} &gt; {lesson.chapter.title}
          </p>
        </div>

        {/* Lesson Content */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8">
          <div className="prose prose-slate prose-invert max-w-none">
            <div
              className="text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: lesson.content
                  .replace(
                    /^# (.+)$/gm,
                    '<h1 class="text-2xl font-bold text-white mb-4 mt-8 first:mt-0">$1</h1>'
                  )
                  .replace(
                    /^## (.+)$/gm,
                    '<h2 class="text-xl font-bold text-cyan-400 mb-3 mt-6">$1</h2>'
                  )
                  .replace(
                    /^### (.+)$/gm,
                    '<h3 class="text-lg font-bold text-white mb-2 mt-4">$1</h3>'
                  )
                  .replace(/^\- (.+)$/gm, '<li class="ml-4 mb-1">$1</li>')
                  .replace(
                    /^\*\*(.+?)\*\*/gm,
                    '<strong class="text-white font-bold">$1</strong>'
                  )
                  .replace(
                    /^```(\w+)?\n([\s\S]*?)```$/gm,
                    '<pre class="bg-slate-900 border border-slate-600 rounded-lg p-4 my-4 overflow-x-auto"><code class="text-cyan-300 text-sm">$2</code></pre>'
                  )
                  .replace(
                    /`([^`]+)`/g,
                    '<code class="bg-slate-700 text-cyan-300 px-2 py-1 rounded text-sm">$1</code>'
                  )
                  .replace(/\n\n/g, '</p><p class="mb-4">')
                  .replace(/^(.+)$/gm, '<p class="mb-4">$1</p>'),
              }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            {lesson.prevLesson ? (
              <Link
                href={`/lessons/${lesson.prevLesson.id}`}
                className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 hover:border-cyan-400/50 transition-colors group"
              >
                <ChevronLeftIcon className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                <div className="text-left">
                  <div className="text-slate-400 text-xs">前のレッスン</div>
                  <div className="text-white text-sm group-hover:text-cyan-400 transition-colors">
                    {lesson.prevLesson.title}
                  </div>
                </div>
              </Link>
            ) : (
              <div></div>
            )}
          </div>

          <Link
            href={`/courses/${lesson.course.id}`}
            className="bg-slate-700 border border-slate-600 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            コースに戻る
          </Link>

          <div>
            {lesson.nextLesson ? (
              <Link
                href={`/lessons/${lesson.nextLesson.id}`}
                className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 hover:border-cyan-400/50 transition-colors group"
              >
                <div className="text-right">
                  <div className="text-slate-400 text-xs">次のレッスン</div>
                  <div className="text-white text-sm group-hover:text-cyan-400 transition-colors">
                    {lesson.nextLesson.title}
                  </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
