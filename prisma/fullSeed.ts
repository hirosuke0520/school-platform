import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 既存データをクリア
  await prisma.userProgress.deleteMany();
  await prisma.learningSession.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // 1. Git(バージョン管理) - 10レッスン
  const gitCourse = await prisma.course.create({
    data: {
      title: 'Git(バージョン管理)',
      description: 'ソースコードを管理するためのシステム',
      orderIndex: 1,
    },
  });

  await createChaptersAndLessons(gitCourse.id, [
    {
      title: 'Git基礎',
      lessons: [
        'コンテナ',
        'WEBアプリ開発の抽象度を上げる',
        'サーバーってなに？',
        '仮想環境ってなに？',
        'Dockerってなに？',
        'コンテナってなに？',
        'イメージってなに？',
        'Dockerをインストールしてみよう',
        'Dockerコマンドを覚えてみよう',
        'Docker Composeを覚えてみよう',
      ]
    }
  ]);

  // 2. Docker(仮想環境構築) - 9レッスン  
  const dockerCourse = await prisma.course.create({
    data: {
      title: 'Docker(仮想環境構築)',
      description: '仮想環境を作成するためのプラットフォーム',
      orderIndex: 2,
    },
  });

  await createChaptersAndLessons(dockerCourse.id, [
    {
      title: 'Docker基礎',
      lessons: [
        'コンテナ',
        'WEBアプリ開発の抽象度を上げる', 
        'サーバーってなに？',
        '仮想環境ってなに？',
        'Dockerってなに？',
        'コンテナってなに？',
        'イメージってなに？',
        'Dockerをインストールしてみよう',
        'Dockerコマンドを覚えてみよう',
      ]
    }
  ]);

  // 3. HTML - 8レッスン
  const htmlCourse = await prisma.course.create({
    data: {
      title: 'HTML',
      description: 'Webページの構造をつくるための言語',
      orderIndex: 3,
    },
  });

  await createChaptersAndLessons(htmlCourse.id, [
    {
      title: 'HTML基礎',
      lessons: [
        'HTMLってなに？',
        'HTMLファイルを作ってみよう',
        'HTML講座',
        'HTML基本構造',
        'head部分の書き方でみよう',
        'ヘッダーを作ってみよう',
        'コンテンツを作ってみよう',
        'リンク要素について',
      ]
    }
  ]);

  // 4. CSS - 8レッスン
  const cssCourse = await prisma.course.create({
    data: {
      title: 'CSS',
      description: 'Webページを装飾するための言語',
      orderIndex: 4,
    },
  });

  await createChaptersAndLessons(cssCourse.id, [
    {
      title: 'CSS基礎',
      lessons: [
        'CSSってなに？',
        'CSSを書いてみよう',
        'CSSを分けてみよう',
        'セレクタとの仕組みてみよう',
        'レスポンシブWebデザイン',
        'メディアクエリ',
        'アニメーションを実装してみよう',
        'Javascript効果を覚えてみよう',
      ]
    }
  ]);

  // 5. JavaScript - 10レッスン
  const jsCourse = await prisma.course.create({
    data: {
      title: 'JavaScript',
      description: 'HTMLやCSSで作った構造や装飾を操作するための言語',
      orderIndex: 5,
    },
  });

  await createChaptersAndLessons(jsCourse.id, [
    {
      title: 'JavaScript基礎',
      lessons: [
        'Javascriptってなに？',
        'Javascriptでできること',
        'Javascript実行環境を覚えてみよう',
        'メソッドリスト',
        'ライブラリとは？',
        'コンソール画面について',
        'リンク要素について',
        'JSON形式について',
        'Javascriptを使用する機会について',
        'Javascript基本をみよう',
      ]
    }
  ]);

  // 6. Linux - 6レッスン
  const linuxCourse = await prisma.course.create({
    data: {
      title: 'Linux',
      description: 'オープンソースで広く使われているOS',
      orderIndex: 6,
    },
  });

  await createChaptersAndLessons(linuxCourse.id, [
    {
      title: 'Linux基礎',
      lessons: [
        'コマンドってなに？',
        'CUIとGUIの違いについて',
        'Linuxでして',
        'CUIの操作をしてみよう',
        'ログとそろってみよう',
        'DDコマンドで領域を作成してみよう',
      ]
    }
  ]);

  // 7. PHP - 30レッスン
  const phpCourse = await prisma.course.create({
    data: {
      title: 'PHP',
      description: 'Webアプリの作成に使われるプログラミング言語',
      orderIndex: 7,
    },
  });

  await createChaptersAndLessons(phpCourse.id, [
    {
      title: 'PHP基礎編',
      lessons: [
        'URLを分解してみよう',
        'ソフトウェアとサーバーについて',
        'Webサーバーについて',
        'デザイナーとコーダーについて',
        'バックエンドエンド',
        'PHPとは？',
        'PHPファイルを作成して表示してみよう',
        'プログラミングでのファイルてみよう',
        'データを投げる',
        'バージョンアップから使えるメソッドてみよう',
      ]
    },
    {
      title: 'PHP応用編',
      lessons: [
        '文字列について',
        '配列について',
        '連想配列について',
        'ループ処理について',
        'データに関数を適用してみよう',
        'ファイルの読み込み',
        '基本的なクラスについて',
        'データーベースについて',
        'バリデーションについて',
        'フォームについて',
      ]
    },
    {
      title: 'PHP実践編',
      lessons: [
        'データベースと詳細な活用',
        '認証について',
        'リダイレクトについて',
        '変数と定数',
        'スコープについて',
        'オブジェクト指向な設計について',
        'フレームワークについて',
        '重複する箇所の統合',
        'プロジェクトを立ち上げてみよう',
        'コミットしてみよう',
      ]
    }
  ]);

  // 8. MySQL - 9レッスン
  const mysqlCourse = await prisma.course.create({
    data: {
      title: 'MySQL',
      description: 'データベースを管理するシステム',
      orderIndex: 8,
    },
  });

  await createChaptersAndLessons(mysqlCourse.id, [
    {
      title: 'MySQL基礎',
      lessons: [
        'MySQLってなに？',
        'SQLクライアントをインストール・連携してみよう',
        'データベースのCRUDを覚えてみよう',
        'テーブルを覚えてみよう',
        'テーブルを作ってみよう',
        'テーブルを結合してみよう',
        'テーブル結合を覚えてみよう',
        'エクスポートとをしてみよう',
        'インデックスを読み',
      ]
    }
  ]);

  // 9. Laravel - 9レッスン
  const laravelCourse = await prisma.course.create({
    data: {
      title: 'Laravel',
      description: '人気の高いPHPのフレームワーク',
      orderIndex: 9,
    },
  });

  await createChaptersAndLessons(laravelCourse.id, [
    {
      title: 'Laravel基礎',
      lessons: [
        'アイレント配列',
        'ルーティング',
        'ブレード',
        'コントローラー',
        'マイグレーション',
        'シーディング',
        'ミドルウェア',
        'ギル',
        'Request',
      ]
    }
  ]);

  // サンプルユーザー
  await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: '山田太郎',
      role: 'LEARNER',
    },
  });

  console.log('完全なシードデータの作成が完了しました（90レッスン）');
}

async function createChaptersAndLessons(courseId: number, chapters: Array<{title: string, lessons: string[]}>) {
  for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
    const chapterData = chapters[chapterIndex];
    
    const chapter = await prisma.chapter.create({
      data: {
        courseId,
        title: chapterData.title,
        orderIndex: chapterIndex + 1,
      },
    });

    for (let lessonIndex = 0; lessonIndex < chapterData.lessons.length; lessonIndex++) {
      await prisma.lesson.create({
        data: {
          chapterId: chapter.id,
          title: chapterData.lessons[lessonIndex],
          content: generateLessonContent(chapterData.lessons[lessonIndex]),
          estimatedMinutes: Math.floor(Math.random() * 20) + 5, // 5-25分のランダム
          orderIndex: lessonIndex + 1,
        },
      });
    }
  }
}

function generateLessonContent(title: string): string {
  const contentTemplates: Record<string, string> = {
    'コンテナ': `
# コンテナとは

コンテナは、アプリケーションとその依存関係をパッケージ化する軽量な仮想化技術です。

## コンテナの特徴

### 1. 軽量性
- OSカーネルを共有するため、仮想マシンより軽量
- 高速な起動時間
- リソース効率が良い

### 2. 可搬性
- 環境に依存しない実行
- 「どこでも動く」を実現
- 開発・本番環境の差異を解消

## 使用例
\`\`\`bash
docker run hello-world
\`\`\`
    `,
    'HTMLってなに？': `
# HTMLとは

HTML（HyperText Markup Language）は、Webページの構造を定義するマークアップ言語です。

## HTMLの役割

### 1. 文書構造の定義
- 見出し、段落、リストなどの構造を明示
- ブラウザに表示方法を指示
- SEOに重要な意味的構造を提供

### 2. 基本的な書き方
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>ページタイトル</title>
</head>
<body>
    <h1>見出し</h1>
    <p>段落</p>
</body>
</html>
\`\`\`

## 重要なポイント
- セマンティック（意味的）なマークアップを心がける
- アクセシビリティを考慮する
- 適切なタグを適切な場所で使用する
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

  return contentTemplates[title] || `
# ${title}

このレッスンでは「${title}」について学習します。

## 概要
${title}の基本的な概念と使い方を理解しましょう。

## 学習目標
- ${title}の基本概念を理解する
- 実際の使用方法を学ぶ
- 実践的なスキルを身につける

## まとめ
${title}は重要な技術要素の一つです。継続的に学習を進めていきましょう。
  `;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });