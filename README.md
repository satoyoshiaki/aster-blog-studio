# Aster Blog Studio

Next.js 14 製のブログプラットフォームです。個人ブログや小規模メディア向けに設計しています。

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **データベース**: PostgreSQL + Prisma
- **認証**: NextAuth.js (JWT + Credentials)
- **スタイリング**: Tailwind CSS
- **言語**: TypeScript

## 機能

### 公開サイト

- トップページ（最新記事・カテゴリ一覧）
- 記事詳細ページ
- カテゴリ別・タグ別アーカイブ
- 全文検索

### 管理画面 (`/admin`)

- 管理者ログイン
- 記事の作成・編集・削除（下書き／公開）
- カテゴリ管理
- タグ管理

## セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/satoyoshiaki/aster-blog-studio.git
cd aster-blog-studio
```

### 2. 依存パッケージをインストール

```bash
npm install
```

### 3. 環境変数を設定

`.env.example` をコピーして `.env.local` を作成し、各値を設定します。

```bash
cp .env.example .env.local
```

| 変数名 | 説明 |
|---|---|
| `DATABASE_URL` | PostgreSQL の接続URL |
| `NEXTAUTH_URL` | アプリのベースURL（例: `http://localhost:3000`）|
| `NEXTAUTH_SECRET` | セッション署名用のランダム文字列 |

### 4. データベースを初期化

```bash
npm run db:push   # スキーマを反映
npm run db:seed   # 初期データを投入
```

シードで以下が作成されます：

- 管理者アカウント: `admin@example.com` / `password123`
- サンプルカテゴリ・タグ・記事

### 5. 開発サーバーを起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアクセスできます。管理画面は [http://localhost:3000/admin](http://localhost:3000/admin) です。

## ディレクトリ構成

```
src/
├── app/
│   ├── admin/          # 管理画面
│   ├── api/auth/       # NextAuth APIルート
│   ├── blog/           # 記事・カテゴリ・タグページ
│   ├── search/         # 検索ページ
│   └── about/          # Aboutページ
├── components/
│   ├── admin/          # 管理画面用コンポーネント
│   ├── blog/           # ブログ表示コンポーネント
│   └── layout/         # ヘッダー・フッター
├── lib/
│   ├── actions.ts      # Server Actions
│   ├── auth.ts         # 認証設定
│   ├── data.ts         # データ取得関数
│   └── prisma.ts       # Prismaクライアント
└── types/              # 型定義
```

## ライセンス

MIT
