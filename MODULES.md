# 各モジュールの詳細説明

## モジュール構成

このシステムは以下のモジュールで構成されています：

### 1. kintoneApi.js
Kintone API関連の機能を提供します。

**主な機能:**
- 現在のアプリ情報取得
- スペース内の全アプリ一覧取得
- アプリ名からアプリID取得
- アプリのスキーマ取得（グループフィールド詳細処理対応）
- レコードデータ取得
- アプリID からアプリ名取得（アプリ名表示機能用）
- **グループフィールド処理**: レイアウト情報からグループ内フィールドの詳細取得
- **フィールドキー生成**: `code`プロパティが存在しないフィールドの適切なキー生成
- **LABELフィールド収集**: レイアウトからLABELフィールドを収集しスキーマに追加

**公開関数:**
```javascript
window.KintoneAPI = {
  getCurrentAppInfo,
  getAllAppsInSpace,
  getAppIdByName,
  getAppSchema,
  getRecords,
  getAppNameById
}
```

### 2. groupFieldProcessor.js
グループフィールド処理機能を提供します。

**主な機能:**
- グループフィールドのスキーマ処理
- グループフィールドのレコードデータ処理
- CSV出力用のグループフィールド処理
- グループフィールドの存在チェック・カウント機能
- **LABELフィールド対応**: グループ内のラベルフィールドの適切な処理（フィールドコードを「FC未定義」、フィールド名を「FN未定義」で表示）
- **ルックアップフィールド対応**: グループ内のルックアップフィールドの詳細情報表示

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
サブテーブルフィールド処理機能を提供します。

**主な機能:**
- サブテーブルフィールドのスキーマ処理
- サブテーブルデータの整理とフォーマット
- CSV出力用のサブテーブル処理
- サブテーブルフィールドの存在チェック・カウント機能
- **LABELフィールド対応**: サブテーブル内のラベルフィールドの適切な処理（フィールドコードを「FC未定義」、フィールド名を「FN未定義」で表示）
- **ルックアップフィールド対応**: サブテーブル内のルックアップフィールドの詳細情報表示

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
データフォーマット機能を提供します。

**主な機能:**
- フィールドタイプの日本語変換
- スキーマの表示用フォーマット
- レコードデータの整理
- **LOOKUPフィールド対応**: ルックアップフィールドの適切な値抽出
- **LABELフィールド**: LABELフィールドのフィールドコードを「FC未定義」、フィールド名を「FN未定義」で表示

**公開関数:**
```javascript
window.DataFormatters = {
  getFieldTypeLabel,
  formatSchema,
  formatRecordData
}
```

### 5. csvExport.js
CSV出力機能を提供します。

**主な機能:**
- スキーマのCSV変換・ダウンロード
- レコードデータのCSV変換・ダウンロード
- CSVエクスポートボタンの追加
- **LABEL・LOOKUPフィールド対応**: ラベル・ルックアップフィールドの適切なCSV出力
- **ルックアップフィールド完全対応**: フィールドタイプに関係なくlookupプロパティを持つフィールドを処理
- **統一されたCSVヘッダー**: 画面表示と完全に一致するヘッダー構成
- **LABELフィールド**: LABELフィールドのフィールドコードを「FC未定義」、フィールド名を「FN未定義」で表示

**公開関数:**
```javascript
window.CSVExport = {
  downloadCSV,
  schemaToCSV,
  recordsToCSV,
  recordsWithSubtablesToCSV,
  addSchemaExportButton,
  addRecordExportButton
}
```

### 6. appCache.js
アプリ名キャッシュ関連の機能を提供します。

**主な機能:**
- `getAppDisplayName(appId)` - アプリ名をキャッシュから取得
- `updateAppNameCache()` - アプリ名キャッシュを更新

### 7. tableHelpers.js
テーブル表示・リサイズ関連の機能を提供します。

**主な機能:**
- `makeTableResizable(table)` - テーブルカラムのリサイズ機能を追加

### 8. optionDetails.js
オプション詳細生成関連の機能を提供します。

**主な機能:**
- `generateOptionDetailsText(field)` - CSV出力用のオプション詳細生成
- `generateOptionDetails(field)` - UI表示用のオプション詳細生成
- `formatReferenceTableCondition(condition)` - 関連レコード一覧の条件フォーマット
- `formatReferenceTableSort(sort)` - 関連レコード一覧のソート条件フォーマット
- `formatReferenceTableFilter(filterCond)` - 関連レコード一覧の絞り込み条件フォーマット

### 9. messageHelpers.js
メッセージ表示関連の機能を提供します。

**主な機能:**
- `showMessage(message, type)` - メッセージ表示

### 10. uiHelpers.js
メインのUIヘルパー機能を提供します。

**主な機能:**
- アプリ一覧表示UI
- スキーマテーブル表示（オプション詳細カラム付き）
- レコードテーブル表示
- **画面リセット機能**: アプリ一覧表示時の画面クリア機能
- **ルックアップフィールド完全対応**: フィールドタイプに関係なくlookupプロパティを持つフィールドを処理
- **統一されたUI**: フィールドコードカラムのフォントとサイズをフィールド名カラムに統一
- **シンプルな表示**: 説明カラムを削除し、より見やすい表示に最適化
- **関連レコード一覧条件表示**: 条件とソート条件の詳細表示（field・relatedField対応）
- **LABELフィールド**: LABELフィールドのフィールドコードを「FC未定義」、フィールド名を「FN未定義」で表示

**公開関数:**
```javascript
window.UIHelpers = {
  showMessage,
  displayAppList,
  displaySchemaTable,
  displayRecordTable,
  makeTableResizable,
  updateAppNameCache,
  getAppDisplayName,
  resetDisplay,
  appNameCache,
  formatReferenceTableCondition,
  formatReferenceTableSort,
  formatReferenceTableFilter
}
```

### 11. queryTable-main.js
メイン機能（統合）を提供します。

**主な機能:**
- メイン統合機能
- 検索UI作成
- 依存関係チェック
- 検索実行
- **UIリセット統合**: アプリ一覧表示ボタンでの画面リセット機能
- **LABELフィールド表示スイッチ**: スキーマ表示でのLABELフィールドの表示/非表示を切り替え可能（レコード表示は常に除外）

**公開関数:**
```javascript
window.QueryTable = {
  executeQuery,
  createQueryUI,
  checkDependencies
}
```

### 12. subtableDisplay.js（オプション）
サブテーブル表示機能を提供します。

**主な機能:**
- サブテーブルデータの専用表示機能
- 各サブテーブルを独立したテーブルとして表示
- 親レコードとの関連表示
- サブテーブルテーブルのカラムリサイズ機能

**公開関数:**
```javascript
window.displaySubtables = (records, schema, containerElement)
window.initSubtableDisplay = () => {}
```

## モジュール間の依存関係

```
queryTable-main.js
├── uiHelpers.js
│   ├── messageHelpers.js
│   ├── tableHelpers.js
│   └── appCache.js
├── dataFormatters.js
├── csvExport.js
│   ├── optionDetails.js
│   └── appCache.js
├── groupFieldProcessor.js
│   └── appCache.js
├── subtableFieldProcessor.js
│   └── appCache.js
└── kintoneApi.js
```

## 開発・拡張

### 新しいモジュールの追加
1. 新しい機能を独立したファイルとして作成
2. `window.ModuleName` として公開
3. queryTable-main.js の依存関係チェックに追加

### カスタマイズ
各モジュールは独立しているため、必要に応じて個別にカスタマイズできます。
