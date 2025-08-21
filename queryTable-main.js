(() => {
  'use strict';

  /**
   * メインのクエリテーブル機能
   * 他のモジュールを組み合わせて動作する統合機能
   *
   * 依存関係:
   * - kintoneApi.js (必須)
   * - dataFormatters.js (必須)
   * - csvExport.js (必須)
   * - uiHelpers.js (必須)
   * - subtableDisplay.js (オプション)
   */

  // 依存関係の確認
  const checkDependencies = () => {
    const requiredModules = ['KintoneAPI', 'DataFormatters', 'CSVExport', 'UIHelpers'];
    const missingModules = [];

    requiredModules.forEach(moduleName => {
      if (!window[moduleName]) {
        missingModules.push(moduleName);
      }
    });

    if (missingModules.length > 0) {
      console.error('必要なモジュールが読み込まれていません:', missingModules);
      alert(`エラー: 以下のモジュールが読み込まれていません:\n${missingModules.join(', ')}\n\n対応するスクリプトファイルを先に読み込んでください。`);
      return false;
    }

    return true;
  };

  /**
   * 検索実行メイン関数
   */
  const executeQuery = async (appName, recordCount) => {
    const resultContainer = document.getElementById('query-result');

    if (!resultContainer) {
      console.error('結果表示用のコンテナが見つかりません');
      return;
    }

    // 結果をクリア
    resultContainer.innerHTML = '';

    try {
      // アプリIDを取得
      console.log(`アプリ "${appName}" を検索中...`);
      const appId = await window.KintoneAPI.getAppIdByName(appName);
      console.log(`アプリID: ${appId}`);

      // スキーマを取得
      console.log('スキーマを取得中...');
      const schema = await window.KintoneAPI.getAppSchema(appId);
      console.log('スキーマ取得完了');

      // レコードを取得
      console.log(`${recordCount}件のレコードを取得中...`);
      const records = await window.KintoneAPI.getRecords(appId, recordCount);
      console.log(`${records.length}件のレコードを取得`);

      // 結果の表示
      const title = document.createElement('h2');
      title.textContent = `アプリ: ${appName} (ID: ${appId})`;
      title.style.color = '#333';
      title.style.borderBottom = '2px solid #0066cc';
      title.style.paddingBottom = '10px';
      resultContainer.appendChild(title);

      // スキーマ表示
      const schemaTitle = document.createElement('h3');
      schemaTitle.textContent = 'データベーススキーマ';
      schemaTitle.style.color = '#0066cc';
      schemaTitle.style.marginTop = '30px';
      resultContainer.appendChild(schemaTitle);

      const formattedSchema = window.DataFormatters.formatSchema(schema);
      window.UIHelpers.displaySchemaTable(formattedSchema, resultContainer);

      // スキーマCSVエクスポート機能を追加
      window.CSVExport.addSchemaExportButton(schema, appName, resultContainer);

      // レコードデータ表示
      const recordTitle = document.createElement('h3');
      recordTitle.textContent = `レコードデータ（先頭${recordCount}件）`;
      recordTitle.style.color = '#0066cc';
      recordTitle.style.marginTop = '30px';
      resultContainer.appendChild(recordTitle);

      const formattedRecords = window.DataFormatters.formatRecordData(records, schema);
      window.UIHelpers.displayRecordTable(formattedRecords, schema, resultContainer);

      // レコードデータCSVエクスポート機能を追加
      window.CSVExport.addRecordExportButton(formattedRecords, schema, appName, resultContainer);

      // サブテーブルを別表として表示（外部ファイルの関数を使用）
      if (typeof window.displaySubtables === 'function') {
        window.displaySubtables(formattedRecords, schema, resultContainer);
      } else {
        console.warn('サブテーブル表示機能が読み込まれていません。subtableDisplay.jsを先に読み込んでください。');
      }

      console.log('表示完了');

    } catch (error) {
      console.error('検索エラー:', error);

      const errorMessage = document.createElement('div');
      errorMessage.style.color = 'red';
      errorMessage.style.padding = '10px';
      errorMessage.style.border = '1px solid red';
      errorMessage.style.backgroundColor = '#ffe6e6';
      errorMessage.style.marginTop = '10px';
      errorMessage.textContent = `エラー: ${error.message}`;
      resultContainer.appendChild(errorMessage);
    }
  };

  /**
   * 検索UIを作成
   */
  const createQueryUI = () => {
    // 依存関係チェック
    if (!checkDependencies()) {
      return;
    }

    // 既にUIが存在する場合は削除
    const existingUI = document.getElementById('query-ui');
    if (existingUI) {
      existingUI.remove();
    }

    const container = document.createElement('div');
    container.id = 'query-ui';
    container.style.padding = '20px';
    container.style.backgroundColor = '#f9f9f9';
    container.style.border = '1px solid #ddd';
    container.style.borderRadius = '5px';
    container.style.margin = '20px';

    // タイトル
    const title = document.createElement('h2');
    title.textContent = 'アプリケーションデータ検索';
    title.style.color = '#333';
    title.style.marginBottom = '20px';
    container.appendChild(title);

    // アプリ名入力
    const appNameLabel = document.createElement('label');
    appNameLabel.textContent = 'アプリケーション名:';
    appNameLabel.style.display = 'block';
    appNameLabel.style.marginBottom = '5px';
    appNameLabel.style.fontWeight = 'bold';
    container.appendChild(appNameLabel);

    const appNameInput = document.createElement('input');
    appNameInput.type = 'text';
    appNameInput.id = 'app-name-input';
    appNameInput.placeholder = '例: 顧客管理';
    appNameInput.style.width = '300px';
    appNameInput.style.padding = '8px';
    appNameInput.style.border = '1px solid #ccc';
    appNameInput.style.borderRadius = '3px';
    appNameInput.style.marginBottom = '10px';
    container.appendChild(appNameInput);

    // アプリ選択補助機能
    const appSelectionContainer = document.createElement('div');
    appSelectionContainer.style.marginBottom = '15px';
    appSelectionContainer.style.display = 'flex';
    appSelectionContainer.style.gap = '10px';
    appSelectionContainer.style.flexWrap = 'wrap';
    appSelectionContainer.style.alignItems = 'center';

    // 現在のアプリを選択するボタン
    const currentAppButton = document.createElement('button');
    currentAppButton.textContent = '現在のアプリを選択';
    currentAppButton.style.padding = '6px 12px';
    currentAppButton.style.backgroundColor = '#28a745';
    currentAppButton.style.color = 'white';
    currentAppButton.style.border = 'none';
    currentAppButton.style.borderRadius = '3px';
    currentAppButton.style.cursor = 'pointer';
    currentAppButton.style.fontSize = '12px';

    currentAppButton.onclick = () => {
      const currentApp = window.KintoneAPI.getCurrentAppInfo();
      if (currentApp && currentApp.appName) {
        appNameInput.value = currentApp.appName;
        window.UIHelpers.showMessage(`現在のアプリ "${currentApp.appName}" が選択されました`, 'success');
      } else {
        window.UIHelpers.showMessage('現在のアプリ情報を取得できませんでした', 'error');
      }
    };

    appSelectionContainer.appendChild(currentAppButton);

    // アプリ一覧表示ボタン
    const showAppsButton = document.createElement('button');
    showAppsButton.textContent = 'アプリ一覧を表示';
    showAppsButton.style.padding = '6px 12px';
    showAppsButton.style.backgroundColor = '#17a2b8';
    showAppsButton.style.color = 'white';
    showAppsButton.style.border = 'none';
    showAppsButton.style.borderRadius = '3px';
    showAppsButton.style.cursor = 'pointer';
    showAppsButton.style.fontSize = '12px';

    showAppsButton.onclick = async () => {
      try {
        showAppsButton.disabled = true;
        showAppsButton.textContent = '取得中...';

        const apps = await window.KintoneAPI.getAllAppsInSpace();
        window.UIHelpers.displayAppList(apps, appNameInput);

      } catch (error) {
        window.UIHelpers.showMessage('アプリ一覧の取得に失敗しました: ' + error.message, 'error');
      } finally {
        showAppsButton.disabled = false;
        showAppsButton.textContent = 'アプリ一覧を表示';
      }
    };

    appSelectionContainer.appendChild(showAppsButton);

    // 入力欄が空の場合の説明
    const helpText = document.createElement('span');
    helpText.textContent = '← 現在のアプリまたは一覧から選択できます';
    helpText.style.fontSize = '12px';
    helpText.style.color = '#666';
    helpText.style.fontStyle = 'italic';
    appSelectionContainer.appendChild(helpText);

    container.appendChild(appSelectionContainer);

    // レコード数入力
    const recordCountLabel = document.createElement('label');
    recordCountLabel.textContent = '取得レコード数:';
    recordCountLabel.style.display = 'block';
    recordCountLabel.style.marginBottom = '5px';
    recordCountLabel.style.fontWeight = 'bold';
    container.appendChild(recordCountLabel);

    const recordCountInput = document.createElement('input');
    recordCountInput.type = 'number';
    recordCountInput.id = 'record-count-input';
    recordCountInput.value = '10';
    recordCountInput.min = '1';
    recordCountInput.max = '500';
    recordCountInput.style.width = '100px';
    recordCountInput.style.padding = '8px';
    recordCountInput.style.border = '1px solid #ccc';
    recordCountInput.style.borderRadius = '3px';
    recordCountInput.style.marginBottom = '20px';
    container.appendChild(recordCountInput);

    // 検索ボタン
    const searchButton = document.createElement('button');
    searchButton.textContent = '検索実行';
    searchButton.style.backgroundColor = '#0066cc';
    searchButton.style.color = 'white';
    searchButton.style.padding = '10px 20px';
    searchButton.style.border = 'none';
    searchButton.style.borderRadius = '5px';
    searchButton.style.cursor = 'pointer';
    searchButton.style.marginLeft = '10px';

    searchButton.onclick = () => {
      const appName = appNameInput.value.trim();
      const recordCount = parseInt(recordCountInput.value);

      if (!appName) {
        // より詳細な案内を表示
        const currentApp = window.KintoneAPI.getCurrentAppInfo();
        let message = 'アプリケーション名を入力してください。\n\n以下の方法で選択できます：\n';

        if (currentApp && currentApp.appName) {
          message += `• "現在のアプリを選択"ボタンで "${currentApp.appName}" を選択\n`;
        }
        message += '• "アプリ一覧を表示"ボタンでスペース内のアプリから選択\n';
        message += '• 直接アプリ名を入力';

        window.UIHelpers.showMessage('アプリケーション名が指定されていません', 'error');
        alert(message);
        return;
      }

      if (!recordCount || recordCount < 1 || recordCount > 500) {
        window.UIHelpers.showMessage('レコード数は1〜500の範囲で入力してください', 'error');
        return;
      }

      searchButton.disabled = true;
      searchButton.textContent = '検索中...';

      executeQuery(appName, recordCount)
        .finally(() => {
          searchButton.disabled = false;
          searchButton.textContent = '検索実行';
        });
    };

    container.appendChild(searchButton);

    // 結果表示エリア
    const resultContainer = document.createElement('div');
    resultContainer.id = 'query-result';
    resultContainer.style.marginTop = '30px';
    container.appendChild(resultContainer);

    // bodyに追加
    document.body.appendChild(container);
  };

  // 一覧画面でUIを表示
  kintone.events.on('app.record.index.show', (event) => {
    // ヘッダーメニューエリアにボタンを追加
    const headerMenuSpace = kintone.app.getHeaderMenuSpaceElement();

    if (headerMenuSpace && !document.getElementById('show-query-ui-btn')) {
      const button = document.createElement('button');
      button.id = 'show-query-ui-btn';
      button.textContent = 'データ検索UI表示';
      button.className = 'kintoneplugin-button-normal';
      button.style.marginLeft = '10px';

      button.onclick = () => {
        createQueryUI();
        // UIが表示されたらスクロール
        setTimeout(() => {
          const queryUI = document.getElementById('query-ui');
          if (queryUI) {
            queryUI.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      };

      headerMenuSpace.appendChild(button);
    }

    return event;
  });

  // グローバル関数として公開（互換性のため）
  window.QueryTable = {
    executeQuery,
    createQueryUI,
    checkDependencies
  };

  console.log('メインクエリテーブル スクリプトが読み込まれました');

})();
