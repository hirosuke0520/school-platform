import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addLongProgressReport() {
  try {
    console.log('🔍 Adding long progress report test data...');

    // 既存の学習セッションを取得
    const sessions = await prisma.learningSession.findMany({
      include: {
        user: true,
        lesson: true,
      },
      take: 3,
    });

    if (sessions.length === 0) {
      console.log('❌ No learning sessions found. Run quick-seed first.');
      return;
    }

    // 長文の進捗報告サンプル
    const longProgressReports = [
      `今日のHTMLの学習では、基本的なタグの使い方について深く理解することができました。特に、<h1>から<h6>までの見出しタグの適切な使い分けについて実践的に学習し、SEOの観点からも重要だということを知りました。

また、段落タグの<p>を使った文章構造の作り方や、<strong>タグと<em>タグの違いについても詳しく学習しました。単純に太字や斜体にするだけでなく、意味的な強調の違いがあることは非常に興味深かったです。

実際にコードを書いてみて、インデントの重要性や、HTMLの可読性について実感することができました。ネストした構造を正しく書くためには、しっかりとしたコードの整理が必要だということがよく分かりました。

次回の学習では、今日学んだ基礎知識を活かして、より複雑なHTML構造に挑戦してみたいと思います。リストタグやテーブルタグについても学習予定です。`,

      `CSSの学習を進める中で、セレクタの概念について理解を深めることができました。要素セレクタ、クラスセレクタ、IDセレクタの使い分けは最初は混乱しましたが、実際に手を動かして練習することで徐々に理解できるようになりました。

特に、カスケード（継承）の仕組みについては、親要素から子要素へのスタイルの継承がどのように働くのかを具体的な例で確認できたのが良かったです。この仕組みを理解することで、効率的なCSSの書き方ができるようになると感じました。

ボックスモデルについても学習しましたが、margin、border、padding、contentの関係性は図解で理解することができました。特に、box-sizingプロパティの違いによってサイズ計算が変わることは実際にコードを書いて確認する必要があると思いました。

今後は、レスポンシブデザインやFlexboxについても学習を進めて、実際のWebサイト制作に活かせるようになりたいです。毎日少しずつでも継続して学習することが重要だと改めて感じています。`,

      `Gitの学習では、バージョン管理の重要性について理解することができました。特に、コミットの概念やブランチの使い方について実際にコマンドを実行しながら学習できたのが非常に有益でした。

git init、git add、git commitの基本的な流れを何度か繰り返すことで、Gitの基本的なワークフローが身につきました。最初はコマンドラインの操作に戸惑いましたが、慣れてくると効率的に作業できることが分かりました。

ブランチの概念については、masterブランチから新しいブランチを作成して、機能開発を行う流れを実際に体験できました。git branch、git checkout、git mergeのコマンドを使って、実際のチーム開発の流れをシミュレーションできたのが良かったです。

GitHubとの連携についても学習し、リモートリポジトリの概念やpush、pullの操作について理解できました。今後は、実際のプロジェクトでGitを活用して、チーム開発の経験を積んでいきたいと思います。コンフリクトの解決方法についても学習が必要だと感じています。`,
    ];

    // 各セッションに長文の進捗報告を追加
    for (let i = 0; i < Math.min(sessions.length, longProgressReports.length); i++) {
      await prisma.learningSession.update({
        where: { id: sessions[i].id },
        data: {
          progressReport: longProgressReports[i],
        },
      });

      console.log(`✅ Updated session ${i + 1}: ${sessions[i].lesson.title} (${longProgressReports[i].length} chars)`);
    }

    // 短い進捗報告も追加
    const shortReports = [
      '今日はHTMLの基本について学習しました。',
      'CSSセレクタの使い方が理解できました！',
      'Gitの基本コマンドを覚えることができました。',
    ];

    const remainingSessions = await prisma.learningSession.findMany({
      where: {
        progressReport: null,
      },
      take: 3,
    });

    for (let i = 0; i < Math.min(remainingSessions.length, shortReports.length); i++) {
      await prisma.learningSession.update({
        where: { id: remainingSessions[i].id },
        data: {
          progressReport: shortReports[i],
        },
      });

      console.log(`✅ Added short report to session: ${shortReports[i]}`);
    }

    console.log('\n🎉 Successfully added progress reports!');
    console.log('📊 View progress at: http://localhost:3000/admin/progress');

  } catch (error) {
    console.error('❌ Error adding progress reports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addLongProgressReport();