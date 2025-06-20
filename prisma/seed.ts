import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 基本コースデータ
  const courses = [
    {
      title: 'Git(バージョン管理)',
      description: 'ソースコードを管理するためのシステム',
      technology: 'Git',
      orderIndex: 1,
    },
    {
      title: 'HTML',
      description: 'Webページの構造をつくるための言語',
      technology: 'HTML',
      orderIndex: 2,
    },
    {
      title: 'CSS',
      description: 'Webページを装飾するための言語',
      technology: 'CSS',
      orderIndex: 3,
    },
    {
      title: 'JavaScript',
      description: 'HTMLやCSSで作った構造や装飾を操作するための言語',
      technology: 'JavaScript',
      orderIndex: 4,
    },
    {
      title: 'Linux',
      description: 'オープンソースで広く使われているOS',
      technology: 'Linux',
      orderIndex: 5,
    },
    {
      title: 'Docker(仮想環境構築)',
      description: '仮想環境を作成するためのプラットフォーム',
      technology: 'Docker',
      orderIndex: 6,
    },
    {
      title: 'PHP',
      description: 'Webアプリの作成に使われるプログラミング言語',
      technology: 'PHP',
      orderIndex: 7,
    },
    {
      title: 'MySQL',
      description: 'データベースを管理するシステム',
      technology: 'MySQL',
      orderIndex: 8,
    },
    {
      title: 'Laravel',
      description: '人気の高いPHPのフレームワーク',
      technology: 'Laravel',
      orderIndex: 9,
    },
  ];

  // 基本コースを作成
  for (const courseData of courses) {
    await prisma.course.create({
      data: courseData,
    });
  }

  // PHPコースの詳細データ
  const phpCourse = await prisma.course.create({
    data: {
      title: 'PHPを理解する',
      description: 'PHPとはどんなものなのかを理解しましょう。',
      technology: 'PHP',
      orderIndex: 10,
    },
  });

  // Laravelコースの詳細データ
  const laravelCourse = await prisma.course.create({
    data: {
      title: 'Laravel基礎',
      description: 'LaravelでWebアプリケーション開発の基礎を学びましょう。',
      technology: 'Laravel',
      orderIndex: 11,
    },
  });

  // PHPコースのチャプターとレッスン
  const phpChapters = [
    {
      title: 'URLをパーツに分けて理解する',
      orderIndex: 1,
      lessons: [
        { title: 'URLを分解して見てみよう', orderIndex: 1, estimatedMinutes: 15 },
      ],
    },
    {
      title: 'リクエストとレスポンス',
      orderIndex: 2,
      lessons: [
        { title: 'リクエストとレスポンス', orderIndex: 1, estimatedMinutes: 10 },
      ],
    },
    {
      title: 'WEBサーバーについて',
      orderIndex: 3,
      lessons: [
        { title: 'Webサーバーについて', orderIndex: 1, estimatedMinutes: 10 },
      ],
    },
    {
      title: 'アプリケーションサーバーについて',
      orderIndex: 4,
      lessons: [
        { title: 'アプリケーションサーバーについて', orderIndex: 1, estimatedMinutes: 10 },
      ],
    },
    {
      title: 'フロントエンドとは',
      orderIndex: 5,
      lessons: [
        { title: 'フロントエンドとは', orderIndex: 1, estimatedMinutes: 5 },
      ],
    },
    {
      title: 'バックエンドとは',
      orderIndex: 6,
      lessons: [
        { title: 'バックエンドとは', orderIndex: 1, estimatedMinutes: 10 },
      ],
    },
    {
      title: 'プログラミング言語について',
      orderIndex: 7,
      lessons: [
        { title: 'PHPとは？', orderIndex: 1, estimatedMinutes: 10 },
        { title: 'PHPファイルを作成して表示してみよう', orderIndex: 2, estimatedMinutes: 10 },
      ],
    },
    {
      title: 'プログラミング用エディタについて',
      orderIndex: 8,
      lessons: [
        { title: 'プログラミング用のエディタについて', orderIndex: 1, estimatedMinutes: 5 },
      ],
    },
  ];

  for (const chapterData of phpChapters) {
    const chapter = await prisma.chapter.create({
      data: {
        courseId: phpCourse.id,
        title: chapterData.title,
        orderIndex: chapterData.orderIndex,
      },
    });

    for (const lessonData of chapterData.lessons) {
      await prisma.lesson.create({
        data: {
          chapterId: chapter.id,
          title: lessonData.title,
          content: getLessonContent(lessonData.title),
          estimatedMinutes: lessonData.estimatedMinutes,
          orderIndex: lessonData.orderIndex,
        },
      });
    }
  }

  // Laravelコースのチャプターとレッスン
  const laravelChapters = [
    {
      title: 'Laravelとは',
      orderIndex: 1,
      lessons: [
        { title: 'Laravelフレームワークの概要', orderIndex: 1, estimatedMinutes: 10 },
        { title: 'MVCアーキテクチャについて', orderIndex: 2, estimatedMinutes: 10 },
      ],
    },
    {
      title: 'Eloquent ORM',
      orderIndex: 2,
      lessons: [
        { title: 'Eloquentの基本', orderIndex: 1, estimatedMinutes: 15 },
        { title: 'リレーションシップ', orderIndex: 2, estimatedMinutes: 15 },
      ],
    },
  ];

  for (const chapterData of laravelChapters) {
    const chapter = await prisma.chapter.create({
      data: {
        courseId: laravelCourse.id,
        title: chapterData.title,
        orderIndex: chapterData.orderIndex,
      },
    });

    for (const lessonData of chapterData.lessons) {
      await prisma.lesson.create({
        data: {
          chapterId: chapter.id,
          title: lessonData.title,
          content: getLessonContent(lessonData.title),
          estimatedMinutes: lessonData.estimatedMinutes,
          orderIndex: lessonData.orderIndex,
        },
      });
    }
  }

  // サンプルユーザー
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: '山田太郎',
      role: 'LEARNER',
    },
  });

  console.log('シードデータの作成が完了しました');
}

function getLessonContent(title: string): string {
  const contents: Record<string, string> = {
    'URLを分解して見てみよう': `
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
    'リクエストとレスポンス': `
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
    'PHPとは？': `
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
  };

  return contents[title] || `# ${title}\n\nこのレッスンの内容は準備中です。`;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });