# テスト環境セットアップ完了

## 概要
Jestから**Vitest + Playwright**のモダンなテスト環境に移行しました。

## テスト構成

### 1. Vitest (ユニット・統合テスト)
- **目的**: コンポーネント、関数、API のテスト
- **設定ファイル**: `vitest.config.ts`
- **実行コマンド**:
  ```bash
  npm run test          # ウォッチモード
  npm run test:watch    # 明示的ウォッチモード
  npm run test -- --run # 1回実行
  npm run test:ui       # UIモード
  ```

### 2. Playwright (E2Eテスト)
- **目的**: ブラウザでの全画面統合テスト
- **設定ファイル**: `playwright.config.ts`
- **実行コマンド**:
  ```bash
  npm run test:e2e      # E2Eテスト実行
  npm run test:e2e:ui   # UIモード
  npm run test:all      # 全テスト実行
  ```

## E2Eテスト網羅範囲

### 認証テスト (`tests/e2e/auth/`)
- ✅ ログイン・ログアウト機能
- ✅ ロール別アクセス制御
- ✅ 未認証時のリダイレクト
- ✅ セッション管理

### 学習者テスト (`tests/e2e/student/`)
- ✅ ダッシュボード表示
- ✅ コース閲覧・選択
- ✅ レッスン表示・進捗追跡
- ✅ ナビゲーション機能

### 管理者テスト (`tests/e2e/admin/`)
- ✅ 管理ダッシュボード
- ✅ コース・チャプター・レッスン管理
- ✅ ユーザー管理（ADMIN専用）
- ✅ コンテンツ作成・編集

### 統合テスト (`tests/e2e/integration/`)
- ✅ 完全な学習フロー
- ✅ 管理者コンテンツ作成→学習者消費
- ✅ ロール別ワークフロー
- ✅ エラーハンドリング
- ✅ レスポンシブデザイン

## 既存テストの移行

### ユニットテスト
- ✅ `src/__tests__/simple-auth.test.ts` - 認証ロジック
- ✅ `src/__tests__/database-display.test.ts` - データベース操作

### 設定変更
- ❌ Jest設定削除 (`jest.config.js`, `jest.setup.js`)
- ✅ Vitest設定追加 (`vitest.config.ts`, `vitest.setup.ts`)
- ✅ Playwright設定追加 (`playwright.config.ts`)

## テスト実行環境

### 対応ブラウザ (Playwright)
- Chromium (デフォルト)
- Firefox
- WebKit (Safari)

### 依存関係
```json
{
  "devDependencies": {
    "@playwright/test": "^1.53.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@vitejs/plugin-react": "^4.5.2",
    "vitest": "^3.2.4",
    "jsdom": "^26.1.0"
  }
}
```

## 実行方法

### 開発時
```bash
# 単体テスト（ウォッチモード）
npm run test

# E2Eテスト（ヘッドレス）
npm run test:e2e

# 全テスト
npm run test:all
```

### CI/CD時
```bash
# 単体テスト（1回実行）
npm run test -- --run

# E2Eテスト（CI環境）
npm run test:e2e -- --reporter=junit
```

## テストデータ
E2Eテストは以下のテストユーザーを想定：
- `admin@test.com` / `admin123` (ADMIN)
- `instructor@test.com` / `instructor123` (INSTRUCTOR)  
- `learner@test.com` / `learner123` (LEARNER)

## メリット

### Vitest
- ⚡ 高速実行（ViteベースのHMR）
- 🔧 TypeScript・ESMネイティブサポート
- 🎯 Jest互換API（簡単移行）
- 📊 UIモード（`npm run test:ui`）

### Playwright
- 🌐 クロスブラウザテスト
- 📱 モバイル・タブレット対応
- 🎥 自動スクリーンショット・動画録画
- 🛠 デバッグツール（`--debug`フラグ）
- 🎭 並列実行サポート

## 注意事項
- E2Eテストはアプリケーションが`http://localhost:3000`で実行中である必要があります
- データベースのテストデータが必要な場合は`npm run db:seed`を実行してください
- CI環境では`npm run test:all`でユニット・E2E両方のテストを実行できます