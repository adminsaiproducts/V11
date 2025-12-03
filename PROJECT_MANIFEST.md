# CRM V11 MANIFEST: Next Generation SFA Platform

## Repository Information
- **Name**: CRM V11
- **URL**: https://github.com/adminsaiproducts/V11
- **Branch**: main (Protected Source of Truth)

## 0. 戦略的使命 (Strategic Mission)

本プロジェクトは、Googleエコシステム（GAS + Firestore + Vertex AI）を極限まで活用した「中小企業向け次世代SFA」の標準モデルである。V9/V10での教訓を活かし、React (Frontend) と GAS (Backend) の完全分離アーキテクチャを採用しつつ、**「開発者の完全な自律稼働（Zero-Touch）」**を実現する。

### V9/V10からの継承と改善点
- **V9の成果**: Firestore連携、CustomerService、10,852件のデータ移行、双方向住所検索API
- **V10の成果**: 3-File Pattern、Material UI、React Router、AI Squad体制
- **V11の目標**: 両バージョンの成果を統合し、安定した開発環境を再構築

## 1. 環境設定

### GCP/Firestore設定
| プロパティ名 | 設定値 |
| :--- | :--- |
| `FIRESTORE_PROJECT_ID` | `crm-appsheet-v7` |
| `FIRESTORE_DATABASE_ID` | `crm-database-v11` |
| `FIRESTORE_EMAIL` | `crm-v11-automation@crm-appsheet-v7.iam.gserviceaccount.com` |

### GAS Script Properties
| プロパティ名 | 用途 |
| :--- | :--- |
| `FIRESTORE_PROJECT_ID` | Firestoreプロジェクト識別 |
| `FIRESTORE_DATABASE_ID` | Firestoreデータベース識別 |
| `FIRESTORE_EMAIL` | サービスアカウント認証 |
| `FIRESTORE_KEY` | サービスアカウント秘密鍵 |
| `GOOGLE_MAPS_API_KEY` | 住所検索 (Geocoding API) |

## 2. 技術アーキテクチャ

### A. React/GAS 完全分離構成
```
V11/
├── dist/                # [Deploy Target]
├── frontend/            # [Client Side] React + Vite
│   ├── src/
│   └── vite.config.ts   # build.outDir = 'dist' (一時出力)
├── src/                 # [Server Side] GAS + TypeScript
│   ├── main.ts          # GAS Entry Point
│   ├── services/        # Business Logic
│   │   ├── firestore.ts
│   │   ├── customer_service.ts
│   │   └── CustomerService.ts
│   ├── types/           # Type Definitions
│   └── utils/           # Utility Functions
├── scripts/             # Build Pipeline (Node.js)
│   ├── inject-stubs.js  # Function Injector
│   └── gas-build.js     # Asset Merger
└── webpack.config.js    # Server Build Settings
```

### B. Technical Rules (鉄の掟)
1. **Total Separation**: Server(GAS)とFrontend(React)の相互import禁止
2. **Explicit Global Assignment**: scripts/inject-stubs.js でトップレベル関数を物理注入
3. **3-File Pattern**: HTMLサイズ制限回避のため、JS/CSSを分離デプロイ

### C. GAS Compatibility Settings
- **TS Config**: `tsconfig.json` の compilerOptions において、`"module": "None"` または `"module": "CommonJS"` を設定（ESNextは禁止）
- **Webpack**: output.library.type は設定せず、プレーンなIIFE（即時実行関数）として出力

## 3. 開発ワークフロー

### Build Commands
```bash
npm run build           # Full build (Backend + Frontend)
npm run build:backend   # Backend only (Webpack)
npm run build:frontend  # Frontend only (Vite)
npm run deploy          # Build + clasp push
npm run push            # clasp push only
```

### Migration Commands
```bash
npm run migrate:customers      # 顧客データ移行
npm run migrate:relationships  # 関係性データ移行
npm run migrate:masters        # マスターデータ移行
npm run migrate:deals          # 案件データ移行
npm run migrate                # 全データ移行
```

## 4. 完了済み機能（V9/V10より継承）

### Phase 1: Database Setup
- Firestore データベース作成 (`crm-database-v9` -> `crm-database-v11`に移行予定)
- データ移行 (ETL): 10,852件
- AuditLog, REST API Endpoint

### Phase 2: Infrastructure Setup
- Build System: Vite + Webpack ハイブリッド構成
- Frontend Foundation: Vite + React + TypeScript
- 3-File Pattern Migration

### Phase 3: Real Data Connection
- Firestore Integration: CustomerService
- Bridge Injection: doPost 実装

### Phase 4: Usability Enhancement
- Search Functionality: 顧客検索機能
- Pagination: ページネーション
- Customer Detail View
- CRUD Operations

### Phase 5: Advanced Features
- Address Lookup: 双方向住所検索API

## 5. V11 実行計画

### Phase 1: 環境構築（現在）
- [x] V11ディレクトリ作成
- [x] V9/V10からのファイルコピー
- [ ] GitHub リポジトリ設定
- [ ] 新規GASプロジェクト作成
- [ ] Firestore Database設定

### Phase 2: 安定化
- [ ] 依存関係の整理
- [ ] ビルドシステムの動作確認
- [ ] デプロイパイプラインの確認

### Phase 3: 機能統合
- [ ] V9の成熟した機能の取り込み
- [ ] V10のUI改善の取り込み
- [ ] テスト環境の整備

## 6. 開発ガイドライン

### 自律実行プロトコル
- **Zero-Touch Command Execution**: 標準的な非破壊コマンドは自動実行
- **Atomic Persistence**: タスク完了時は必ずgit commit/push
- **Diagnose First**: 作業開始前に環境確認

### Anti-Hallucination
- "I think it works" is banned
- デプロイ後は必ずPlaywrightによるRPA検証

## 7. 参照ドキュメント

- [CURRENT_STATUS.md](./CURRENT_STATUS.md) - 進捗状況
- [deployment_handover_report.md](./deployment_handover_report.md) - デプロイ教訓
- [GOOGLE_MAPS_API_SETUP.md](./GOOGLE_MAPS_API_SETUP.md) - Maps API設定
- [ADDRESS_LOOKUP_IMPLEMENTATION.md](./ADDRESS_LOOKUP_IMPLEMENTATION.md) - 住所検索実装
