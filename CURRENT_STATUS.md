# CRM V11 Current Status

## プロジェクト情報

| 項目 | 値 |
| :--- | :--- |
| プロジェクト名 | CRM V11 System |
| GAS Script ID | `1_4EVl4Rtsn1b4q0gmxveXEZOi2OCVSJh-lmYES7IcV7x4X-ybw4dXsj9` |
| GAS Editor URL | https://script.google.com/d/1_4EVl4Rtsn1b4q0gmxveXEZOi2OCVSJh-lmYES7IcV7x4X-ybw4dXsj9/edit |
| Web App URL | https://script.google.com/macros/s/AKfycbydiCwtRQ1oO_4Sg-EqcFAr1YdOdlefI6oIOPuXG4RCtOMah3TZJ9vmWrwlyr3ejWzj5Q/exec |
| GitHub Repository | https://github.com/adminsaiproducts/V11 |
| Firestore Database | `crm-database-v9` (GCP: `crm-appsheet-v7`) |

## GAS Script Properties (設定が必要)

| プロパティ名 | 設定値 | 用途 |
| :--- | :--- | :--- |
| `FIRESTORE_PROJECT_ID` | `crm-appsheet-v7` | Firestoreプロジェクト識別 |
| `FIRESTORE_DATABASE_ID` | `crm-database-v9` | Firestoreデータベース識別 |
| `FIRESTORE_EMAIL` | `crm-v7-automation@crm-appsheet-v7.iam.gserviceaccount.com` | サービスアカウント認証 |
| `FIRESTORE_KEY` | `config/serviceAccount.json` の `private_key` 全文 | サービスアカウント秘密鍵 |
| `GOOGLE_MAPS_API_KEY` | `AIzaSyAYUikfoE-EUb187g-5ZemY-P4ZfdMQCmA` | 住所検索 (Geocoding API) |

**注意**: GAS Script Propertiesは手動設定が必要です。GASエディタ > プロジェクトの設定 > スクリプトプロパティで設定してください。

## ビルドシステム構成 (3-File Pattern)

**採用戦略:** Separated Assets Pattern (GAS Size Limitation対応)

### 技術スタック
- **Frontend Build:** Vite + React + TypeScript
- **Backend Build:** Webpack + gas-webpack-plugin
- **GAS Template:** 3-File Pattern (`index.html` + `javascript.html` + `stylesheet.html`)

### ファイル構成
```
dist/
├── index.html          (0.4 KB)   - GAS template with <?!= include() ?> tags
├── javascript.html     (448.9 KB) - All JS wrapped in <script> tags
├── stylesheet.html     (0.9 KB)   - All CSS wrapped in <style> tags
├── bundle.js          (20.3 KB)  - Backend GAS code (with CustomerService)
└── appsscript.json    (0.4 KB)   - GAS manifest
```

## 完了したマイルストーン

### Phase 0: V11環境構築 ✅ (2025-12-03)
1.  **V11ディレクトリ作成**: V9/V10からのファイルマージ
2.  **GitHub設定**: https://github.com/adminsaiproducts/V11
3.  **GASプロジェクト作成**: clasp create成功
4.  **ビルドシステム修正**: gas-build.js修正
5.  **初回デプロイ**: V11 Initial Deployment (v1)

### 継承した機能（V9/V10より）
- Firestore連携 (CustomerService)
- 顧客検索機能
- ページネーション
- 顧客詳細表示
- 顧客作成・更新機能
- 双方向住所検索API（Backend実装済み）

## 次のステップ

### Phase 1: GAS設定 (優先)
1. [ ] GAS Script Propertiesの設定（上記テーブル参照）
2. [ ] Firestoreライブラリの動作確認
3. [ ] Web Appアクセステスト

### Phase 2: データベース移行検討
1. [ ] `crm-database-v11`の新規作成検討
2. [ ] 既存データのバックアップ
3. [ ] 新DBへのデータ移行

### Phase 3: 機能改善
1. [ ] Material UIの統合確認
2. [ ] React Routerの統合確認
3. [ ] 住所検索UIの統合

## 既知の課題

### 設定が必要な項目
- [ ] GAS Script Propertiesは手動設定が必要
- [ ] Firestoreの秘密鍵はGASに直接設定が必要

### 技術的課題
- フロントエンドが簡易版のため、Material UI統合が不完全な可能性あり

## 変更履歴 (Changelog)

| Date | Type | Details | Status |
| :--- | :--- | :--- | :--- |
| 2025-12-03 | SETUP | V11環境構築開始 | ✅ Done |
| 2025-12-03 | MERGE | V9/V10からのファイルコピー・マージ | ✅ Done |
| 2025-12-03 | SETUP | GitHub repository設定 (adminsaiproducts/V11) | ✅ Done |
| 2025-12-03 | SETUP | GASプロジェクト作成 (clasp create) | ✅ Done |
| 2025-12-03 | FIX | gas-build.js修正（assetsディレクトリパス） | ✅ Done |
| 2025-12-03 | DEPLOY | 初回デプロイ成功 (v1) | ✅ Done |
