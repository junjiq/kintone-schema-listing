# Kintone Schema Listing

## 概要
Kintoneアプリケーションのスキーマとデータを検索・表示・エクスポートするためのシステムです。

## ファイル構成

### 必須ファイル（以下の順序で読み込む）
1. **kintoneApi.js** - Kintone API関連の機能
2. **groupFieldProcessor.js** - グループフィールド処理機能
3. **subtableFieldProcessor.js** - サブテーブルフィールド処理機能
4. **dataFormatters.js** - データフォーマット機能
5. **csvExport.js** - CSV出力機能
6. **uiHelpers.js** - UI関連のヘルパー機能
7. **queryTable-main.js** - メイン機能（統合）

### オプションファイル
- **subtableDisplay.js** - サブテーブル表示機能

## 各モジュールの機能

### 1. kintoneApi.js
- 現在のアプリ情報取得
- スペース内の全アプリ一覧取得
- アプリ名からアプリID取得
- アプリのスキーマ取得
- レコードデータ取得

**公開関数:**
```javascript
window.KintoneAPI = {
  getCurrentAppInfo,
  getAllAppsInSpace,
  getAppIdByName,
  getAppSchema,
  getRecords
}
```

### 2. groupFieldProcessor.js
- グループフィールドのスキーマ処理
- グループフィールドのレコードデータ処理
- CSV出力用のグループフィールド処理
- グループフィールドの存在チェック・カウント機能

**公開関数:**
```javascript
window.GroupFieldProcessor = {
  processGroupSchema,
  processGroupRecordData,
  formatGroupFieldValue,
  processGroupSchemaForCSV,
  getGroupHeadersForCSV,
  getGroupValueForCSV,
  hasGroupFields,
  countGroupFields
}
```

### 3. subtableFieldProcessor.js
- サブテーブルフィールドのスキーマ処理
- サブテーブルデータの整理とフォーマット
- CSV出力用のサブテーブル処理
- サブテーブルフィールドの存在チェック・カウント機能

**公開関数:**
```javascript
window.SubtableFieldProcessor = {
  processSubtableSchema,
  formatSubtableData,
  processSubtableRecordData,
  processSubtableSchemaForCSV,
  processSubtableRecordsForCSV,
  hasSubtableFields,
  countSubtableFields,
  countSubtableRows
}
```

### 4. dataFormatters.js
- フィールドタイプの日本語変換
- スキーマの表示用フォーマット
- レコードデータの整理

**公開関数:**
```javascript
window.DataFormatters = {
  getFieldTypeLabel,
  formatSchema,
  formatRecordData
}
```

### 5. csvExport.js
- スキーマのCSV変換・ダウンロード
- レコードデータのCSV変換・ダウンロード
- CSVエクスポートボタンの追加

**公開関数:**
```javascript
window.CSVExport = {
  downloadCSV,
  schemaToCSV,
  recordsToCSV,
  addSchemaExportButton,
  addRecordExportButton
}
```

### 6. uiHelpers.js
- メッセージ表示機能
- アプリ一覧表示UI
- スキーマテーブル表示
- レコードテーブル表示

**公開関数:**
```javascript
window.UIHelpers = {
  showMessage,
  displayAppList,
  displaySchemaTable,
  displayRecordTable
}
```

### 7. queryTable-main.js
- メイン統合機能
- 検索UI作成
- 依存関係チェック
- 検索実行

**公開関数:**
```javascript
window.QueryTable = {
  executeQuery,
  createQueryUI,
  checkDependencies
}
```

## 使用方法

### 1. ファイルの読み込み
Kintoneアプリの「JavaScript/CSSでカスタマイズ」で以下の順序でファイルを読み込んでください：

```html
<!-- 必須ファイル（順序重要） -->
<script src="kintoneApi.js"></script>
<script src="dataFormatters.js"></script>
<script src="csvExport.js"></script>
<script src="uiHelpers.js"></script>
<script src="queryTable-main.js"></script>

<!-- オプション -->
<script src="subtableDisplay.js"></script>
```

### 2. 基本的な使用方法
1. Kintoneアプリの一覧画面で「データ検索UI表示」ボタンをクリック
2. アプリケーション名を入力または選択
3. 取得レコード数を指定（1-500）
4. 「検索実行」ボタンをクリック

### 3. アプリ選択方法
- **現在のアプリを選択**: 現在表示中のアプリを自動選択
- **アプリ一覧を表示**: スペース内の全アプリを一覧表示して選択
- **直接入力**: アプリ名を直接入力

### 4. CSV出力機能
- **スキーマCSV**: データベース構造をCSV形式でダウンロード
- **レコードCSV**: 取得したレコードデータをCSV形式でダウンロード
- ファイル名: `アプリ名_schema_YYYY-MM-DD.csv` / `アプリ名_records_YYYY-MM-DD.csv`

## 機能一覧

### 表示機能
- アプリのスキーマ（フィールド構造）表示
- レコードデータのテーブル表示
- サブテーブルデータの詳細表示（subtableDisplay.js使用時）

### 検索機能
- アプリ名による検索
- 指定件数でのレコード取得
- リアルタイムでの結果表示

### エクスポート機能
- スキーマ情報のCSV出力
- レコードデータのCSV出力
- Excel対応（BOM付きUTF-8）

### UI機能
- 現在のアプリ自動選択
- アプリ一覧からの選択
- メッセージ通知システム
- エラーハンドリング

## エラー対処

### 依存関係エラー
必須モジュールが読み込まれていない場合、アラートが表示されます。
指定された順序でファイルを読み込んでください。

### API エラー
- アプリが見つからない場合: アプリ名を確認してください
- 権限エラー: アプリへのアクセス権限を確認してください
- ネットワークエラー: 接続状況を確認してください

## 開発・拡張

### 新しいモジュールの追加
1. 新しい機能を独立したファイルとして作成
2. `window.ModuleName` として公開
3. queryTable-main.js の依存関係チェックに追加

### カスタマイズ
各モジュールは独立しているため、必要に応じて個別にカスタマイズできます。

## 変更履歴
- v1.0.0: 初期リリース（モジュール分割版）
- 旧バージョンから機能を分割し、保守性を向上

## 注意事項
- Kintone環境でのみ動作します
- 大量データの取得は時間がかかる場合があります
- CSVファイルの文字エンコーディングはUTF-8（BOM付き）です

