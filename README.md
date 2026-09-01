# 有給休暇管理台帳

Netlify Functions + Netlify Blobs で動く、独立ホスティング版の有給休暇管理台帳です。
（claude.ai は使わず、このリポジトリだけで完結して動きます）

## 構成
- `public/index.html` … フロントエンド（1ファイル、外部ライブラリなし）
- `netlify/functions/data.js` … データの読み書きAPI（`/api/data`）。Netlify Blobsにデータを保存します
- `netlify.toml` … Netlifyのビルド・ルーティング設定
- `migration-data.json` … 今のclaude.aiアプリから取り出した現在の20名分のデータ（**Gitには含まれません**。デプロイ後にアプリの「データをインポート」から読み込んでください）

## デプロイ手順（初回のみ）

### 1. GitHubにアップロード
Gitがインストールされていない場合は、GitHubのWebサイトで新規リポジトリを作成し、このフォルダの中身（`migration-data.json`を除く）をブラウザから直接アップロードできます。
Gitを使う場合は次の手順です。

```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<あなたのアカウント>/<リポジトリ名>.git
git push -u origin main
```

**リポジトリは Private（非公開）で作成してください。** 従業員の個人情報を扱うアプリのソースです。

### 2. Netlifyでサイトを作成
1. https://app.netlify.com にログイン（GitHubアカウントでログイン可）
2. 「Add new site」→「Import an existing project」→ GitHubを選び、今作成したリポジトリを選択
3. ビルド設定は `netlify.toml` から自動で読み込まれます（publish: `public`、functions: `netlify/functions`）。そのまま「Deploy」でOKです

### 3. パスワードを設定する（重要）
1. Netlifyのサイト管理画面 →「Site configuration」→「Environment variables」
2. `APP_PASSWORD` という名前で、共通パスワードを値として追加
3. 保存後、「Deploys」タブから再デプロイ（Trigger deploy）してください（環境変数は再デプロイ後に反映されます）

これで `https://<サイト名>.netlify.app` にアクセスすると、設定したパスワードでログインできるようになります。

### 4. 既存データの取り込み
1. デプロイ後のアプリにログイン
2. 右上の「⚙ 設定」→「データをインポート」
3. このフォルダにある `migration-data.json` を選択（このファイルは従業員の個人情報を含むため、Gitにはアップロードされません。ご自身のPC内でのみ使ってください）

## 管理者を追加する
このアプリには「共通パスワード」を知っている人なら誰でもアクセスできます。他の管理者にはNetlifyのURLと`APP_PASSWORD`の値を個別にお伝えください。
アカウント別のログイン（誰がいつ編集したか等）が必要な場合は、別途認証の仕組みを追加する必要があります。

## パスワードを変更したいとき
Netlifyの環境変数 `APP_PASSWORD` の値を変更し、再デプロイしてください。変更後は、それまでログインしていた人も新しいパスワードでの再ログインが必要になります。

## ローカルで試す場合
[Netlify CLI](https://docs.netlify.com/cli/get-started/) を使うと、ローカルでも動作確認できます。

```
npm install -g netlify-cli
npm install
netlify dev
```
`.env` ファイルまたは `netlify dev` の環境変数設定で `APP_PASSWORD` を指定してください。
