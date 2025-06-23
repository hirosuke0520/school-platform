import { PrismaClient, UserRole, ProgressStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function quickSeed() {
  try {
    console.log('🌱 Quick seeding started...');

    // Clear existing data
    await prisma.userProgress.deleteMany();
    await prisma.learningSession.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.chapter.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create users
    const adminHash = await bcrypt.hash('Admin123', 12);
    const instructorHash = await bcrypt.hash('instructor123', 12);
    const learnerHash = await bcrypt.hash('learner123', 12);

    const users = await prisma.user.createMany({
      data: [
        {
          name: 'システム管理者',
          email: 'admin@example.com',
          passwordHash: adminHash,
          role: UserRole.ADMIN,
          emailVerified: new Date(),
        },
        {
          name: '田中講師',
          email: 'instructor@test.com',
          passwordHash: instructorHash,
          role: UserRole.INSTRUCTOR,
          emailVerified: new Date(),
        },
        {
          name: '佐藤学習者',
          email: 'learner@test.com',
          passwordHash: learnerHash,
          role: UserRole.LEARNER,
          emailVerified: new Date(),
        },
        {
          name: '鈴木太郎',
          email: 'learner2@test.com',
          passwordHash: learnerHash,
          role: UserRole.LEARNER,
          emailVerified: new Date(),
        },
      ],
    });

    console.log(`👥 Created ${users.count} users`);

    // Get created users
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
    const learnerUser = await prisma.user.findUnique({ where: { email: 'learner@test.com' } });
    const learnerUser2 = await prisma.user.findUnique({ where: { email: 'learner2@test.com' } });

    // Create courses
    const course1 = await prisma.course.create({
      data: {
        title: 'Web開発基礎',
        description: 'HTML、CSS、JavaScriptの基礎を学習します',
        orderIndex: 1,
      },
    });

    const course2 = await prisma.course.create({
      data: {
        title: 'Git基礎',
        description: 'バージョン管理システムGitの基本操作を学習します',
        orderIndex: 2,
      },
    });

    console.log('📚 Created courses');

    // Create chapters and lessons for Web開発基礎
    const chapter1 = await prisma.chapter.create({
      data: {
        title: 'HTML基礎',
        description: 'HTMLの基本的な書き方を学習します',
        courseId: course1.id,
        orderIndex: 1,
      },
    });

    const chapter2 = await prisma.chapter.create({
      data: {
        title: 'CSS基礎',
        description: 'CSSの基本的な書き方を学習します',
        courseId: course1.id,
        orderIndex: 2,
      },
    });

    const chapter3 = await prisma.chapter.create({
      data: {
        title: 'Git基本操作',
        description: 'Gitの基本的なコマンドを学習します',
        courseId: course2.id,
        orderIndex: 1,
      },
    });

    console.log('📖 Created chapters');

    // Create lessons
    const lesson1 = await prisma.lesson.create({
      data: {
        title: 'HTMLとは',
        content: `# HTMLとは

HTMLはWebページを作るためのマークアップ言語です。

## 基本構造

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

- HTMLは**構造**を定義する
- タグを使って要素を記述する
- 適切なセマンティックタグを使うことが重要`,
        chapterId: chapter1.id,
        orderIndex: 1,
      },
    });

    const lesson2 = await prisma.lesson.create({
      data: {
        title: 'HTMLタグの基本',
        content: `# HTMLタグの基本

よく使われるHTMLタグを覚えましょう。

## 見出しタグ
- h1: 最重要見出し
- h2: セクション見出し  
- h3-h6: サブ見出し

## テキストタグ
- p: 段落
- strong: 重要テキスト
- em: 強調テキスト

## リストタグ
- ul: 順序なしリスト
- ol: 順序ありリスト
- li: リスト項目`,
        chapterId: chapter1.id,
        orderIndex: 2,
      },
    });

    const lesson3 = await prisma.lesson.create({
      data: {
        title: 'CSSとは',
        content: `# CSSとは

CSS（Cascading Style Sheets）は、HTMLで作った構造にスタイル（見た目）を指定するための言語です。

## 基本書式

\`\`\`css
セレクタ {
    プロパティ: 値;
}
\`\`\`

## 例
\`\`\`css
h1 {
    color: blue;
    font-size: 24px;
}
\`\`\`

## 重要なプロパティ
- color: 文字色
- background-color: 背景色
- font-size: 文字サイズ
- margin: 外側の余白
- padding: 内側の余白`,
        chapterId: chapter2.id,
        orderIndex: 1,
      },
    });

    const lesson4 = await prisma.lesson.create({
      data: {
        title: 'Gitとは',
        content: `# Gitとは

Gitは分散型バージョン管理システムです。

## Gitの特徴
- ファイルの変更履歴を管理
- 複数人での開発をサポート
- ブランチ機能で並行開発が可能

## 基本コマンド
- \`git init\`: リポジトリの初期化
- \`git add\`: ステージングエリアに追加
- \`git commit\`: コミット（変更を記録）
- \`git status\`: 現在の状態を確認

## 初回設定
\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
\`\`\``,
        chapterId: chapter3.id,
        orderIndex: 1,
      },
    });

    console.log('📝 Created lessons');

    // Create user progress (some completed, some in progress)
    if (learnerUser && learnerUser2) {
      await prisma.userProgress.createMany({
        data: [
          // learner@test.com の進捗
          {
            userId: learnerUser.id,
            lessonId: lesson1.id,
            status: ProgressStatus.COMPLETED,
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2日前
          },
          {
            userId: learnerUser.id,
            lessonId: lesson2.id,
            status: ProgressStatus.IN_PROGRESS,
          },
          {
            userId: learnerUser.id,
            lessonId: lesson3.id,
            status: ProgressStatus.COMPLETED,
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1日前
          },
          
          // learner2@test.com の進捗
          {
            userId: learnerUser2.id,
            lessonId: lesson1.id,
            status: ProgressStatus.COMPLETED,
            completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3日前
          },
          {
            userId: learnerUser2.id,
            lessonId: lesson4.id,
            status: ProgressStatus.IN_PROGRESS,
          },
        ],
      });

      // Create learning sessions
      await prisma.learningSession.createMany({
        data: [
          {
            userId: learnerUser.id,
            lessonId: lesson1.id,
            startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 30分
          },
          {
            userId: learnerUser.id,
            lessonId: lesson2.id,
            startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1時間前開始
            endedAt: null, // 進行中
          },
          {
            userId: learnerUser2.id,
            lessonId: lesson1.id,
            startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            endedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45分
          },
        ],
      });

      console.log('📊 Created user progress and learning sessions');
    }

    console.log('\n✅ Quick seed completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('👨‍💼 Admin: admin@example.com / Admin123');
    console.log('👨‍🏫 Instructor: instructor@test.com / instructor123');
    console.log('👨‍🎓 Learner: learner@test.com / learner123');
    console.log('👨‍🎓 Learner2: learner2@test.com / learner123');
    console.log('\n🌐 Access: http://localhost:3000');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickSeed();