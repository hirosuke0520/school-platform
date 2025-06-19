# School Platform MVP

プログラミング学習プラットフォームのMVP（ユーザー画面）

## 技術スタック

- **Framework**: Next.js 15.3.4 (App Router)
- **Styling**: TailwindCSS v4.1.0
- **Language**: TypeScript
- **Icons**: Heroicons

## 実装済み画面

### 1. ダッシュボード（TOP画面）
- **URL**: `/`
- **機能**: 
  - 学習中のコンテンツ表示
  - 技術別コース一覧
  - 学習進捗の可視化

### 2. コース詳細画面
- **URL**: `/courses/[id]`
- **機能**:
  - コース概要表示
  - チャプター一覧
  - 学習進捗表示

### 3. チャプター一覧画面
- **URL**: `/courses/[id]/chapters`
- **機能**:
  - チャプター別の学習状況
  - 各チャプターの詳細情報

### 4. レッスン詳細画面
- **URL**: `/courses/[id]/chapters/[chapterId]/lessons/[lessonId]`
- **機能**:
  - レッスン内容表示
  - サイドバーでのコンテキスト情報
  - 学習完了機能

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 開発サーバーの起動
```bash
npm run dev
```

### 3. ブラウザでアクセス
```
http://localhost:3000
```

## プロジェクト構造

```
src/
├── app/
│   ├── globals.css           # グローバルスタイル
│   ├── layout.tsx            # ルートレイアウト
│   ├── page.tsx              # ダッシュボード
│   └── courses/
│       └── [id]/
│           ├── page.tsx      # コース詳細
│           └── chapters/
│               ├── page.tsx  # チャプター一覧
│               └── [chapterId]/
│                   └── lessons/
│                       └── [lessonId]/
│                           └── page.tsx  # レッスン詳細
```

## 特徴

- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **ダークテーマ**: 目に優しいダークカラーパレット
- **モックデータ**: DB接続なしで動作確認可能
- **TypeScript**: 型安全性を確保

## モックデータ

現在は以下のモックデータが実装されています：

- 9つの技術コース（Git, HTML, CSS, JavaScript, Linux, Docker, PHP, MySQL, Laravel）
- PHPコースの詳細なチャプター構成
- レッスンコンテンツのサンプル

## 次のステップ

1. **バックエンド統合**: API接続とデータベース連携
2. **認証機能**: ログイン・ユーザー管理
3. **学習進捗管理**: 実際の進捗追跡機能
4. **管理画面**: コンテンツ管理機能

## 開発用コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm run start

# リント実行
npm run lint
```