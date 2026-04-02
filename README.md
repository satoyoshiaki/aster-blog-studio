# Night Bottle

Night Bottle は、成人向け作品のおすすめを匿名で交換する Next.js 14 App Router アプリです。投稿時に 1 本送り、承認済みプールから別の 1 本を受け取ります。

## 主な機能

- 年齢確認モーダルとローカル保存
- URL 投稿フォーム、匿名コメント、タグ、同意チェック、honeypot
- 交換結果ページと共有 URL コピー
- 承認済み投稿の履歴一覧と通報
- 管理画面での簡易ログイン、承認 / 却下、許可ドメイン管理、NG ワード管理
- Supabase 未設定時のモックフォールバック

## セットアップ

1. 依存関係をインストールします。

```bash
npm install
```

2. 環境変数を作成します。

```bash
cp .env.example .env.local
```

3. 開発サーバーを起動します。

```bash
npm run dev
```

4. ブラウザで `http://localhost:3000` を開きます。

## Supabase を使う場合

1. Supabase プロジェクトを作成します。
2. `supabase/schema.sql` を実行してテーブルを作成します。
3. 必要なら `supabase/seed.sql` を流します。
4. `.env.local` に以下を設定します。

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
ADMIN_PASSWORD=change-me
ADMIN_SESSION_SECRET=long-random-secret
CSRF_SECRET=long-random-secret
IP_HASH_SALT=long-random-secret
```

`SUPABASE_URL` または `SUPABASE_SERVICE_ROLE_KEY` が未設定なら、アプリは `src/lib/mock-data.ts` を使って起動します。

## API

- `POST /api/submit`: 投稿して交換を実行
- `GET /api/history`: 承認済み投稿履歴
- `POST /api/report`: 通報受付
- `POST /api/admin/login`: 管理ログイン
- `GET /api/admin/submissions`: 全投稿一覧
- `POST /api/admin/moderate`: 承認 / 却下
- `GET|POST /api/admin/domains`: 許可ドメイン管理
- `GET|POST /api/admin/keywords`: NG ワード管理

## 管理画面

- URL: `/admin`
- 認証: `.env.local` の `ADMIN_PASSWORD`
- セッション: 署名付き Cookie

## 補足

- 外部ページのメタデータ取得は `src/lib/metadata.ts` が担当します。
- URL は公式ドメイン許可リストと NG ワードでチェックされます。
- 年齢確認前は `data-sensitive="true"` のサムネイルが CSS でぼかされます。
