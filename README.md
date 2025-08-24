# Kintone Schema Listing

## 概要
Kintoneアプリケーションのスキーマとデータを検索・表示・エクスポートするためのシステムです。
データベース構造の詳細な確認、レコードデータの表示、CSVエクスポート機能を提供します。

## 主な機能
- **スキーマ表示**: フィールド構造の詳細表示（オプション詳細付き）
- **レコードデータ表示**: テーブル形式での見やすい表示
- **CSV出力**: スキーマ・レコードデータの完全エクスポート
- **テーブルリサイズ**: マウスドラッグでカラム幅調整
- **グループ・サブテーブル対応**: 複雑なフィールド構造に完全対応

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
- スキーマテーブル表示（オプション詳細カラム付き）
- レコードテーブル表示
- テーブルカラムリサイズ機能（マウスドラッグ対応）
- フィールドオプション詳細生成（選択肢、グループ・サブテーブルフィールド数表示）

**公開関数:**
```javascript
window.UIHelpers = {
  showMessage,
  displayAppList,
  displaySchemaTable,
  displayRecordTable,
  makeTableResizable
}
```

### 8. subtableDisplay.js（オプション）
- サブテーブルデータの専用表示機能
- 各サブテーブルを独立したテーブルとして表示
- 親レコードとの関連表示
- サブテーブルテーブルのカラムリサイズ機能

**公開関数:**
```javascript
window.displaySubtables = (records, schema, containerElement)
window.initSubtableDisplay = () => {}
```

## 詳細機能

### テーブル表示機能
- **カラムリサイズ**: 全テーブル（スキーマ、レコード、サブテーブル）でマウスドラッグによるカラム幅調整
- **オプション詳細表示**: CSVと同等の詳細情報をブラウザ上で確認
  - 選択肢型フィールド: 「選択肢キー:表示名」形式
  - グループフィールド: 「グループ内フィールド数: X」
  - サブテーブルフィールド: 「サブフィールド数: X」
  - その他フィールド: 「設定名=値」形式

### スキーマ表示の詳細
- **メインフィールド**: フィールドコード、名前、タイプ、必須、説明、オプション詳細
- **サブフィールド**: グループ内・サブテーブル内フィールドを階層表示
- **視覚的区別**: サブフィールドは背景色とインデントで区別

### CSV出力の詳細
- **スキーマCSV**: 全フィールド情報（グループ・サブテーブル展開済み）
- **レコードCSV**: 基本レコードデータ
- **サブテーブル含むCSV**: サブテーブルデータも別セクションとして出力
- **文字エンコーディング**: UTF-8 BOM付き（Excel対応）

### 9. queryTable-main.js
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
<script src="groupFieldProcessor.js"></script>
<script src="subtableFieldProcessor.js"></script>
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
- **スキーマ表示**: フィールド構造の詳細表示（オプション詳細カラム付き）
- **レコードデータ表示**: テーブル形式での見やすい表示
- **サブテーブル表示**: 各サブテーブルを独立したテーブルとして表示（subtableDisplay.js使用時）
- **カラムリサイズ**: 全テーブルでマウスドラッグによる幅調整

### 検索機能
- **アプリ名検索**: 部分一致でのアプリ検索
- **指定件数取得**: 1-500件の範囲でレコード取得
- **リアルタイム結果表示**: 即座に結果をテーブル表示

### エクスポート機能
- **スキーマCSV**: 完全なフィールド情報（グループ・サブテーブル展開）
- **レコードCSV**: 基本レコードデータ
- **サブテーブル含むCSV**: サブテーブルデータも完全出力
- **Excel対応**: BOM付きUTF-8エンコーディング

### UI機能
- **アプリ選択**: 現在のアプリ自動選択・一覧からの選択・直接入力
- **メッセージシステム**: 成功・エラー・情報メッセージの表示
- **エラーハンドリング**: 詳細なエラー情報とガイダンス
- **レスポンシブUI**: 様々な画面サイズに対応

### 高度な機能
- **グループフィールド対応**: グループ内フィールドの完全サポート
- **サブテーブル対応**: サブテーブルフィールドの完全サポート
- **オプション詳細**: 選択肢・設定値・フィールド数の詳細表示
- **依存関係チェック**: モジュール読み込み状況の自動確認

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
- **v1.3.0**: UI機能大幅強化
  - オプション詳細カラム追加（CSVと同等の詳細情報表示）
  - テーブルカラムリサイズ機能（全テーブル対応）
  - グループ・サブテーブルフィールド数表示
  - ラベルフィールドサポート追加
  - サブテーブル表示のリサイズ対応
- **v1.2.0**: アーキテクチャ改善
  - グループフィールド処理の専用モジュール化（groupFieldProcessor.js）
  - サブテーブルフィールド処理の専用モジュール化（subtableFieldProcessor.js）
  - コード保守性向上・重複コード削除
- **v1.1.0**: 機能拡張
  - グループフィールド内スキーマ表示
  - CSV出力でのグループフィールド処理
  - サブテーブル処理の完全対応
- **v1.0.0**: 初期リリース（モジュール分割版）
  - 旧バージョンから機能を分割し、保守性を向上

## 注意事項
- **環境要件**: Kintone環境でのみ動作します
- **パフォーマンス**: 大量データの取得は時間がかかる場合があります（最大500件まで）
- **文字エンコーディング**: CSVファイルはUTF-8（BOM付き）でExcel対応
- **ブラウザ対応**: モダンブラウザ（Chrome、Firefox、Edge、Safari）推奨
- **権限**: アプリへの参照権限が必要です
- **ファイル読み込み順序**: 依存関係を守って正しい順序で読み込んでください

## パフォーマンス最適化
- **大きなテーブル**: カラムリサイズ機能により必要な情報に集中して表示
- **サブテーブルデータ**: 必要に応じてsubtableDisplay.jsを読み込み
- **CSV出力**: 大量データの場合は段階的に出力することを推奨

