# インストールとセットアップ

## 前提条件

- Kintone環境へのアクセス権限
- アプリへの参照権限
- モダンブラウザ（Chrome、Firefox、Edge、Safari）

## ファイル構成

### 必須ファイル（以下の順序で読み込む）
1. **kintoneApi.js** - Kintone API関連の機能
2. **groupFieldProcessor.js** - グループフィールド処理機能
3. **subtableFieldProcessor.js** - サブテーブルフィールド処理機能
4. **dataFormatters.js** - データフォーマット機能
5. **csvExport.js** - CSV出力機能
6. **appCache.js** - アプリ名キャッシュ関連の機能
7. **tableHelpers.js** - テーブル表示・リサイズ関連の機能
8. **optionDetails.js** - オプション詳細生成関連の機能
9. **messageHelpers.js** - メッセージ表示関連の機能
10. **uiHelpers.js** - メインのUIヘルパー機能
11. **queryTable-main.js** - メイン機能（統合）

### オプションファイル
- **subtableDisplay.js** - サブテーブル表示機能

## インストール手順

### 1. ファイルの準備
すべてのJavaScriptファイルをKintoneアプリの「JavaScript/CSSでカスタマイズ」で使用できる場所に配置してください。

### 2. ファイルの読み込み
Kintoneアプリの「JavaScript/CSSでカスタマイズ」で以下の順序でファイルを読み込んでください：

```html
<!-- 必須ファイル（順序重要） -->
<script src="kintoneApi.js"></script>
<script src="groupFieldProcessor.js"></script>
<script src="subtableFieldProcessor.js"></script>
<script src="dataFormatters.js"></script>
<script src="csvExport.js"></script>
<script src="appCache.js"></script>
<script src="tableHelpers.js"></script>
<script src="optionDetails.js"></script>
<script src="messageHelpers.js"></script>
<script src="uiHelpers.js"></script>
<script src="queryTable-main.js"></script>

<!-- オプション -->
<script src="subtableDisplay.js"></script>
```

### 3. 依存関係の確認
ファイル読み込み後、ブラウザのコンソールで以下のメッセージが表示されることを確認してください：

```
アプリキャッシュ スクリプトが読み込まれました
CSV出力 スクリプトが読み込まれました
データフォーマット スクリプトが読み込まれました
Kintone API スクリプトが読み込まれました
メッセージヘルパー スクリプトが読み込まれました
サブテーブル表示機能が利用可能になりました
サブテーブル表示スクリプトが読み込まれました
テーブルヘルパー スクリプトが読み込まれました
UI ヘルパー スクリプトが読み込まれました
オプション詳細 スクリプトが読み込まれました
グループフィールドプロセッサー スクリプトが読み込まれました
サブテーブルフィールドプロセッサー スクリプトが読み込まれました
メインクエリテーブル スクリプトが読み込まれました
```

## 設定

### 環境要件
- **Kintone環境**: このシステムはKintone環境でのみ動作します
- **権限**: アプリへの参照権限が必要です
- **ブラウザ**: モダンブラウザ（Chrome、Firefox、Edge、Safari）推奨

### パフォーマンス設定
- **最大レコード数**: 500件まで取得可能
- **CSV出力**: 大量データの場合は段階的に出力することを推奨
- **LABELフィールド**: 不要な場合は表示スイッチをOFFにしてパフォーマンスを向上

## 動作確認

### 1. 基本的な動作確認
1. Kintoneアプリの一覧画面で「データ検索UI表示」ボタンが表示されることを確認
2. ボタンをクリックして検索UIが表示されることを確認
3. 現在のアプリが自動選択されることを確認

### 2. 機能確認
1. アプリ一覧表示機能の確認
2. スキーマ表示機能の確認
3. レコード表示機能の確認
4. CSV出力機能の確認

## トラブルシューティング

### 依存関係エラー
必須モジュールが読み込まれていない場合、アラートが表示されます。
指定された順序でファイルを読み込んでください。

### API エラー
- アプリが見つからない場合: アプリ名を確認してください
- 権限エラー: アプリへのアクセス権限を確認してください
- ネットワークエラー: 接続状況を確認してください

詳細なトラブルシューティングについては、[TROUBLESHOOTING.md](TROUBLESHOOTING.md)を参照してください。
