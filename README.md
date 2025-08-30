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
- **高度なフィールド対応**: 計算フィールド、関連レコード一覧、ルックアップフィールドの詳細情報表示
- **アプリ名表示**: 関連レコード一覧・ルックアップフィールドでアプリ名も併せて表示
- **UIリセット機能**: アプリ一覧表示時の画面自動リセット
- **ルックアップフィールド完全対応**: フィールドタイプに関係なくlookupプロパティを持つフィールドをルックアップとして処理
- **統一されたUI**: フィールドコードカラムのフォントとサイズをフィールド名カラムに統一
- **シンプルな表示**: 説明カラムを削除し、より見やすい表示に最適化
- **統一されたCSVヘッダー**: 画面表示とCSV出力のヘッダーを完全統一
- **LABELフィールド表示スイッチ**: LABELフィールドの表示/非表示を切り替え可能
- **関連レコード一覧条件表示**: 条件とソート条件の詳細表示（field・relatedField対応）
- **LABELフィールド**: LABELフィールドのフィールドコードを「FC未定義」、フィールド名を「FN未定義」で表示

## クイックスタート

### 1. ファイルの読み込み
Kintoneアプリの「JavaScript/CSSでカスタマイズ」で以下の順序でファイルを読み込んでください（App名の表示を安定させるため `appCache.js` は先に読み込み推奨）：

```html
<!-- 必須ファイル（順序重要） -->
<script src="kintoneApi.js"></script>
<script src="groupFieldProcessor.js"></script>
<script src="subtableFieldProcessor.js"></script>
<script src="dataFormatters.js"></script>
<script src="appCache.js"></script>
<script src="csvExport.js"></script>
<script src="tableHelpers.js"></script>
<script src="optionDetails.js"></script>
<script src="messageHelpers.js"></script>
<script src="uiHelpers.js"></script>
<script src="queryTable-main.js"></script>

<!-- オプション -->
<script src="subtableDisplay.js"></script>
```

### 2. 基本的な使用方法
1. Kintoneアプリの一覧画面で「データ検索UI表示」ボタンをクリック
2. アプリケーション名を入力または選択
3. 取得レコード数を指定（1-500）
4. LABELフィールドの表示設定を選択（チェックボックス）
5. 「検索実行」ボタンをクリック

## 詳細ドキュメント

詳細な情報については、以下のドキュメントを参照してください：

- **[INSTALLATION.md](INSTALLATION.md)** - インストールとセットアップ手順
- **[USAGE.md](USAGE.md)** - 使用方法と機能詳細
- **[MODULES.md](MODULES.md)** - 各モジュールの詳細説明
- **[API.md](API.md)** - APIリファレンス
- **[CHANGELOG.md](CHANGELOG.md)** - 変更履歴
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - トラブルシューティング

## ライセンス
このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。




