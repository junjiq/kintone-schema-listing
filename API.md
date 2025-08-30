# APIリファレンス

## 概要

このドキュメントでは、Kintone Schema Listingシステムで使用可能なAPI関数について説明します。

## グローバル関数

### window.AppCache

アプリ名キャッシュと表示名の解決機能を提供します。

#### getAppDisplayName(appId)
キャッシュからアプリ名を取得し、`アプリ名 (appId)` 形式で返します。キャッシュに無い場合は `アプリID: appId` を返します。

**パラメータ:**
- `appId` (string|number): アプリID

**戻り値:** string

**使用例:**
```javascript
const name = window.AppCache.getAppDisplayName(123);
// 例: "顧客管理 (123)" または "アプリID: 123"
```

#### updateAppNameCache()
スペース内のアプリ一覧からキャッシュを更新します。

**戻り値:** Promise<void>

**使用例:**
```javascript
await window.AppCache.updateAppNameCache();
```

### window.QueryTable

メインのクエリ実行機能を提供します。

#### executeQuery(appName, recordCount, showLabels)
アプリのスキーマとレコードデータを取得して表示します。

**パラメータ:**
- `appName` (string): アプリ名
- `recordCount` (number): 取得するレコード数（1-500）
- `showLabels` (boolean): LABELフィールドを表示するかどうか

**戻り値:** Promise

**使用例:**
```javascript
window.QueryTable.executeQuery('テストアプリ', 100, true)
  .then(() => {
    console.log('クエリ実行完了');
  })
  .catch(error => {
    console.error('エラー:', error);
  });
```

#### createQueryUI()
検索UIを作成します。

**戻り値:** void

**使用例:**
```javascript
window.QueryTable.createQueryUI();
```

#### checkDependencies()
依存関係をチェックします。

**戻り値:** boolean

**使用例:**
```javascript
if (window.QueryTable.checkDependencies()) {
  console.log('すべての依存関係が満たされています');
} else {
  console.error('依存関係エラーがあります');
}
```

### window.KintoneAPI

Kintone API関連の機能を提供します。

#### getCurrentAppInfo()
現在のアプリ情報を取得します。

**戻り値:** Promise<Object>

**使用例:**
```javascript
window.KintoneAPI.getCurrentAppInfo()
  .then(appInfo => {
    console.log('アプリ情報:', appInfo);
  });
```

#### getAllAppsInSpace()
スペース内の全アプリ一覧を取得します。

**戻り値:** Promise<Array>

**使用例:**
```javascript
window.KintoneAPI.getAllAppsInSpace()
  .then(apps => {
    console.log('アプリ一覧:', apps);
  });
```

#### getAppIdByName(appName)
アプリ名からアプリIDを取得します。

**パラメータ:**
- `appName` (string): アプリ名

**戻り値:** Promise<number>

**使用例:**
```javascript
window.KintoneAPI.getAppIdByName('テストアプリ')
  .then(appId => {
    console.log('アプリID:', appId);
  });
```

#### getAppSchema(appId)
アプリのスキーマを取得します。

**パラメータ:**
- `appId` (number): アプリID

**戻り値:** Promise<Object>

**使用例:**
```javascript
window.KintoneAPI.getAppSchema(123)
  .then(schema => {
    console.log('スキーマ:', schema);
  });
```

#### getRecords(appId, limit)
レコードデータを取得します。

**パラメータ:**
- `appId` (number): アプリID
- `limit` (number): 取得するレコード数

**戻り値:** Promise<Array>

**使用例:**
```javascript
window.KintoneAPI.getRecords(123, 100)
  .then(records => {
    console.log('レコード:', records);
  });
```

#### getAppNameById(appId)
アプリIDからアプリ名を取得します。

**パラメータ:**
- `appId` (number): アプリID

**戻り値:** Promise<string>

**使用例:**
```javascript
window.KintoneAPI.getAppNameById(123)
  .then(appName => {
    console.log('アプリ名:', appName);
  });
```

### window.GroupFieldProcessor

グループフィールド処理機能を提供します。

#### processGroupSchema(field, fieldCode, getFieldTypeLabel)
グループフィールドのスキーマを処理します。

**パラメータ:**
- `field` (Object): グループフィールドのスキーマ
- `fieldCode` (string): フィールドコード
- `getFieldTypeLabel` (Function): フィールドタイプラベル取得関数

**戻り値:** Array

**使用例:**
```javascript
const subFields = window.GroupFieldProcessor.processGroupSchema(
  groupField,
  'group_field',
  window.DataFormatters.getFieldTypeLabel
);
```

#### processGroupRecordData(record, field, fieldCode)
グループフィールドのレコードデータを処理します。

**パラメータ:**
- `record` (Object): レコードデータ
- `field` (Object): グループフィールドのスキーマ
- `fieldCode` (string): フィールドコード

**戻り値:** Object

**使用例:**
```javascript
const groupData = window.GroupFieldProcessor.processGroupRecordData(
  record,
  groupField,
  'group_field'
);
```

#### hasGroupFields(schema)
グループフィールドが存在するかチェックします。

**パラメータ:**
- `schema` (Object): スキーマオブジェクト

**戻り値:** boolean

**使用例:**
```javascript
if (window.GroupFieldProcessor.hasGroupFields(schema)) {
  console.log('グループフィールドが存在します');
}
```

#### countGroupFields(schema)
グループフィールド数をカウントします。

**パラメータ:**
- `schema` (Object): スキーマオブジェクト

**戻り値:** number

**使用例:**
```javascript
const count = window.GroupFieldProcessor.countGroupFields(schema);
console.log('グループフィールド数:', count);
```

### window.SubtableFieldProcessor

サブテーブルフィールド処理機能を提供します。

#### processSubtableSchema(field, fieldCode, getFieldTypeLabel)
サブテーブルフィールドのスキーマを処理します。

**パラメータ:**
- `field` (Object): サブテーブルフィールドのスキーマ
- `fieldCode` (string): フィールドコード
- `getFieldTypeLabel` (Function): フィールドタイプラベル取得関数

**戻り値:** Array

**使用例:**
```javascript
const subFields = window.SubtableFieldProcessor.processSubtableSchema(
  subtableField,
  'subtable_field',
  window.DataFormatters.getFieldTypeLabel
);
```

#### hasSubtableFields(schema)
サブテーブルフィールドが存在するかチェックします。

**パラメータ:**
- `schema` (Object): スキーマオブジェクト

**戻り値:** boolean

**使用例:**
```javascript
if (window.SubtableFieldProcessor.hasSubtableFields(schema)) {
  console.log('サブテーブルフィールドが存在します');
}
```

#### countSubtableFields(schema)
サブテーブルフィールド数をカウントします。

**パラメータ:**
- `schema` (Object): スキーマオブジェクト

**戻り値:** number

**使用例:**
```javascript
const count = window.SubtableFieldProcessor.countSubtableFields(schema);
console.log('サブテーブルフィールド数:', count);
```

### window.DataFormatters

データフォーマット機能を提供します。

#### getFieldTypeLabel(fieldType)
フィールドタイプを日本語ラベルに変換します。

**パラメータ:**
- `fieldType` (string): フィールドタイプ

**戻り値:** string

**使用例:**
```javascript
const label = window.DataFormatters.getFieldTypeLabel('SINGLE_LINE_TEXT');
console.log('フィールドタイプ:', label); // 「1行テキスト」
```

#### formatSchema(schema, getFieldTypeLabel)
スキーマを表示用にフォーマットします。

**パラメータ:**
- `schema` (Object): スキーマオブジェクト
- `getFieldTypeLabel` (Function): フィールドタイプラベル取得関数

**戻り値:** Array

**使用例:**
```javascript
const formattedSchema = window.DataFormatters.formatSchema(
  schema,
  window.DataFormatters.getFieldTypeLabel
);
```

#### formatRecordData(records, schema)
レコードデータを整理します。

**パラメータ:**
- `records` (Array): レコードデータの配列
- `schema` (Object): スキーマオブジェクト

**戻り値:** Array

**使用例:**
```javascript
const formattedRecords = window.DataFormatters.formatRecordData(records, schema);
```

### window.CSVExport

CSV出力機能を提供します。

#### downloadCSV(data, filename)
CSVファイルをダウンロードします。

**パラメータ:**
- `data` (string): CSVデータ
- `filename` (string): ファイル名

**戻り値:** void

**使用例:**
```javascript
window.CSVExport.downloadCSV(csvData, 'export.csv');
```

#### schemaToCSV(schema, appName)
スキーマをCSV形式に変換します。

**パラメータ:**
- `schema` (Object): スキーマオブジェクト
- `appName` (string): アプリ名

**戻り値:** string

**使用例:**
```javascript
const csvData = window.CSVExport.schemaToCSV(schema, 'テストアプリ');
```

#### recordsToCSV(records, schema, appName)
レコードデータをCSV形式に変換します。

**パラメータ:**
- `records` (Array): レコードデータの配列
- `schema` (Object): スキーマオブジェクト
- `appName` (string): アプリ名

**戻り値:** string

**使用例:**
```javascript
const csvData = window.CSVExport.recordsToCSV(records, schema, 'テストアプリ');
```

#### recordsWithSubtablesToCSV(records, schema)
メインレコードCSVに続けて、各サブテーブルをセクションとして連結したCSV文字列を生成します。

**パラメータ:**
- `records` (Array): レコードデータの配列（`formatRecordData` の出力に対応）
- `schema` (Object): スキーマオブジェクト

**戻り値:** string

**補足:** サブテーブルセクションは「`=== メインレコードデータ ===`」の後に、`サブテーブル: 名称` の見出し付きで連結されます。

#### addRecordExportButton(records, schema, appName, containerElement)
レコードCSVエクスポート用のボタン群（メイン/サブテーブル含む）をUIに追加します。

**パラメータ:**
- `records` (Array): レコードデータの配列
- `schema` (Object): スキーマオブジェクト
- `appName` (string): アプリ名
- `containerElement` (HTMLElement): 追加先の要素

**備考:** Kintone画面のフォーム配下でも誤って送信されないよう、ボタンは `type="button"` を使用しています。

### window.UIHelpers

UIヘルパー機能を提供します。

#### displayAppList(apps, inputElement)
アプリ一覧を表示します。

**パラメータ:**
- `apps` (Array): アプリ一覧
- `inputElement` (HTMLElement): 入力要素

**戻り値:** void

**使用例:**
```javascript
window.UIHelpers.displayAppList(apps, document.getElementById('app-input'));
```

#### displaySchemaTable(formattedSchema, containerElement)
スキーマテーブルを表示します。

**パラメータ:**
- `formattedSchema` (Array): フォーマット済みスキーマ
- `containerElement` (HTMLElement): コンテナ要素

**戻り値:** void

**使用例:**
```javascript
window.UIHelpers.displaySchemaTable(formattedSchema, document.getElementById('schema-container'));
```

#### displayRecordTable(records, schema, containerElement)
レコードテーブルを表示します。

**パラメータ:**
- `records` (Array): レコードデータの配列
- `schema` (Object): スキーマオブジェクト
- `containerElement` (HTMLElement): コンテナ要素

**戻り値:** void

**使用例:**
```javascript
window.UIHelpers.displayRecordTable(records, schema, document.getElementById('records-container'));
```

#### resetDisplay()
画面をリセットします。

**戻り値:** void

**使用例:**
```javascript
window.UIHelpers.resetDisplay();
```

### window.MessageHelpers

メッセージ表示機能を提供します。

#### showMessage(message, type)
メッセージを表示します。

**パラメータ:**
- `message` (string): メッセージ内容
- `type` (string): メッセージタイプ（'success', 'error', 'info'）

**戻り値:** void

**使用例:**
```javascript
window.MessageHelpers.showMessage('処理が完了しました', 'success');
window.MessageHelpers.showMessage('エラーが発生しました', 'error');
window.MessageHelpers.showMessage('情報メッセージ', 'info');
```

### window.OptionDetails

オプション詳細生成機能を提供します。

#### generateOptionDetailsText(field)
CSV出力用のオプション詳細を生成します。

**パラメータ:**
- `field` (Object): フィールドオブジェクト

**戻り値:** string

**使用例:**
```javascript
const optionDetails = window.OptionDetails.generateOptionDetailsText(field);
```

#### generateOptionDetails(field)
UI表示用のオプション詳細を生成します。

**パラメータ:**
- `field` (Object): フィールドオブジェクト

**戻り値:** string

**使用例:**
```javascript
const optionDetails = window.OptionDetails.generateOptionDetails(field);
```

### window.TableHelpers

テーブル表示・リサイズ機能を提供します。

#### makeTableResizable(table)
テーブルカラムのリサイズ機能を追加します。

**パラメータ:**
- `table` (HTMLElement): テーブル要素

**戻り値:** void

**使用例:**
```javascript
const table = document.getElementById('my-table');
window.TableHelpers.makeTableResizable(table);
```

## イベント

### カスタムイベント

システムは以下のカスタムイベントを発火します：

#### 'queryCompleted'
クエリが完了したときに発火します。

**イベントデータ:**
- `schema`: スキーマデータ
- `records`: レコードデータ
- `appName`: アプリ名

**使用例:**
```javascript
document.addEventListener('queryCompleted', (event) => {
  console.log('クエリ完了:', event.detail);
});
```

#### 'exportCompleted'
エクスポートが完了したときに発火します。

**イベントデータ:**
- `type`: エクスポートタイプ（'schema', 'records'）
- `filename`: ファイル名

**使用例:**
```javascript
document.addEventListener('exportCompleted', (event) => {
  console.log('エクスポート完了:', event.detail);
});
```

## エラーハンドリング

### エラーオブジェクト

システムは以下の形式のエラーオブジェクトを返します：

```javascript
{
  type: 'error_type',
  message: 'エラーメッセージ',
  details: '詳細情報'
}
```

### エラータイプ

- `DEPENDENCY_ERROR`: 依存関係エラー
- `API_ERROR`: APIエラー
- `PERMISSION_ERROR`: 権限エラー
- `NETWORK_ERROR`: ネットワークエラー
- `VALIDATION_ERROR`: バリデーションエラー

### エラーハンドリング例

```javascript
window.QueryTable.executeQuery('テストアプリ', 100, true)
  .then(() => {
    console.log('成功');
  })
  .catch(error => {
    switch (error.type) {
      case 'DEPENDENCY_ERROR':
        console.error('依存関係エラー:', error.message);
        break;
      case 'API_ERROR':
        console.error('APIエラー:', error.message);
        break;
      case 'PERMISSION_ERROR':
        console.error('権限エラー:', error.message);
        break;
      default:
        console.error('予期しないエラー:', error);
    }
  });
```

## 設定オプション

### グローバル設定

システムの動作をカスタマイズするための設定オプション：

```javascript
window.KintoneSchemaListingConfig = {
  // 最大レコード数
  maxRecordCount: 500,

  // デフォルトのLABELフィールド表示設定
  defaultShowLabels: true,

  // CSV出力の文字エンコーディング
  csvEncoding: 'UTF-8',

  // テーブルのデフォルト設定
  tableSettings: {
    resizable: true,
    sortable: false,
    pageSize: 50
  },

  // ログレベル
  logLevel: 'info' // 'debug', 'info', 'warn', 'error'
};
```

## パフォーマンス最適化

### 大量データの処理

大量のデータを処理する際の推奨事項：

1. **レコード数の制限**: 一度に取得するレコード数を500件以下に制限
2. **段階的処理**: 大量データの場合は段階的に処理
3. **メモリ管理**: 不要なデータは適切に解放

### メモリ使用量の最適化

```javascript
// 大量データ処理時のメモリ管理例
const processLargeDataset = async (appId, totalRecords) => {
  const batchSize = 100;
  const batches = Math.ceil(totalRecords / batchSize);

  for (let i = 0; i < batches; i++) {
    const offset = i * batchSize;
    const records = await window.KintoneAPI.getRecords(appId, batchSize, offset);

    // データ処理
    processRecords(records);

    // メモリ解放
    records.length = 0;

    // 次のバッチまで待機
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};
```
