(() => {
  'use strict';

  /**
   * UI関連のヘルパー関数
   * メッセージ表示、アプリ一覧表示、テーブル表示などのUI機能を担当
   */

  // アプリ名キャッシュ
  let appNameCache = {};

  /**
   * アプリ名をキャッシュから取得、なければ「アプリID: [ID]」を返す
   */
  const getAppDisplayName = (appId) => {
    if (appNameCache[appId]) {
      return `${appNameCache[appId]} (${appId})`;
    }
    return `アプリID: ${appId}`;
  };

  /**
   * アプリ名キャッシュを更新
   */
  const updateAppNameCache = async () => {
    try {
      const apps = await KintoneAPI.getAllAppsInSpace();
      apps.forEach(app => {
        appNameCache[app.appId] = app.name;
      });
      console.log('アプリ名キャッシュを更新しました:', appNameCache);
    } catch (error) {
      console.warn('アプリ名キャッシュの更新に失敗:', error);
    }
  };

  /**
   * テーブルカラムのリサイズ機能を追加
   */
  const makeTableResizable = (table) => {
    const headers = table.querySelectorAll('th');

    headers.forEach((header, index) => {
      // リサイズハンドルを作成
      const resizer = document.createElement('div');
      resizer.style.position = 'absolute';
      resizer.style.top = '0';
      resizer.style.right = '0';
      resizer.style.width = '5px';
      resizer.style.height = '100%';
      resizer.style.cursor = 'col-resize';
      resizer.style.backgroundColor = 'transparent';
      resizer.style.zIndex = '1';

      let isResizing = false;
      let startX = 0;
      let startWidth = 0;

      // マウスダウンイベント
      resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = header.offsetWidth;
        header.style.backgroundColor = '#e6f3ff';
        resizer.style.backgroundColor = '#0066cc';
        document.body.style.userSelect = 'none';
      });

      // マウスムーブイベント（ドキュメント全体）
      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const diff = e.clientX - startX;
        const newWidth = Math.max(50, startWidth + diff);
        header.style.width = newWidth + 'px';
      });

      // マウスアップイベント（ドキュメント全体）
      document.addEventListener('mouseup', () => {
        if (isResizing) {
          isResizing = false;
          header.style.backgroundColor = '';
          resizer.style.backgroundColor = 'transparent';
          document.body.style.userSelect = '';
        }
      });

      header.style.position = 'relative';
      header.appendChild(resizer);
    });
  };

  /**
   * フィールドのオプション詳細を生成
   */
  const generateOptionDetails = (field) => {
    let optionDetails = '';
    const fieldType = field.rawType || field.type;

    // 計算フィールドの場合
    if (fieldType === 'CALC') {
      if (field.expression) {
        optionDetails = `計算式: ${field.expression}`;
      } else if (field.options && field.options.expression) {
        optionDetails = `計算式: ${field.options.expression}`;
      } else {
        optionDetails = '計算フィールド';
      }
    }
    // 関連レコード一覧フィールドの場合
    else if (fieldType === 'REFERENCE_TABLE') {
      const details = [];
      if (field.referenceTable && field.referenceTable.relatedApp) {
        const appDisplayName = getAppDisplayName(field.referenceTable.relatedApp.app);
        details.push(`関連アプリ: ${appDisplayName}`);
      }
      if (field.referenceTable && field.referenceTable.condition) {
        details.push(`条件: ${field.referenceTable.condition}`);
      }
      if (field.referenceTable && field.referenceTable.filterCond) {
        details.push(`絞り込み: ${field.referenceTable.filterCond}`);
      }
      if (field.referenceTable && field.referenceTable.displayFields) {
        const displayFieldCodes = field.referenceTable.displayFields.join(', ');
        details.push(`表示フィールド: ${displayFieldCodes}`);
      }
      if (field.referenceTable && field.referenceTable.sort) {
        const sortInfo = field.referenceTable.sort;
        details.push(`ソート: ${sortInfo.field} (${sortInfo.order})`);
      }
      optionDetails = details.length > 0 ? details.join('; ') : '関連レコード一覧';
    }
    // ルックアップフィールドの場合
    else if (fieldType === 'LOOKUP') {
      const details = [];
      if (field.lookup && field.lookup.relatedApp) {
        const appDisplayName = getAppDisplayName(field.lookup.relatedApp.app);
        details.push(`参照アプリ: ${appDisplayName}`);
      }
      if (field.lookup && field.lookup.relatedKeyField) {
        details.push(`参照キー: ${field.lookup.relatedKeyField}`);
      }
      if (field.lookup && field.lookup.fieldMappings) {
        const mappings = field.lookup.fieldMappings.map(mapping =>
          `${mapping.field}→${mapping.relatedField}`
        );
        details.push(`フィールドマッピング: ${mappings.join(', ')}`);
      }
      if (field.lookup && field.lookup.lookupPickerFields) {
        details.push(`検索対象: ${field.lookup.lookupPickerFields.join(', ')}`);
      }
      if (field.lookup && field.lookup.filterCond) {
        details.push(`絞り込み: ${field.lookup.filterCond}`);
      }
      if (field.lookup && field.lookup.sort) {
        const sortInfo = field.lookup.sort;
        details.push(`ソート: ${sortInfo.field} (${sortInfo.order})`);
      }
      optionDetails = details.length > 0 ? details.join('; ') : 'ルックアップ';
    }
    // グループフィールドの場合
    else if (fieldType === 'GROUP') {
      const groupFieldCount = field.subFields ? field.subFields.length : 0;
      optionDetails = `グループ内フィールド数: ${groupFieldCount}`;
    }
    // サブテーブルフィールドの場合
    else if (fieldType === 'SUBTABLE') {
      const subFieldCount = field.subFields ? field.subFields.length : 0;
      optionDetails = `サブフィールド数: ${subFieldCount}`;
    }
    // 通常のオプション詳細処理
    else if (field.options) {
      if (fieldType === 'DROP_DOWN' || fieldType === 'RADIO_BUTTON' ||
          fieldType === 'CHECK_BOX' || fieldType === 'MULTI_SELECT') {
        // 選択肢型フィールドの場合
        const choices = Object.keys(field.options).map(key =>
          `${key}:${field.options[key].label || field.options[key]}`);
        optionDetails = choices.join('; ');
      } else {
        // その他のオプション
        optionDetails = Object.keys(field.options).map(key =>
          `${key}=${JSON.stringify(field.options[key])}`).join('; ');
      }
    }

    return optionDetails;
  };

  /**
   * メッセージ表示関数
   */
  const showMessage = (message, type = 'info') => {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.padding = '10px';
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.marginBottom = '10px';
    messageDiv.style.fontWeight = 'bold';
    messageDiv.classList.add('temp-message');

    // タイプに応じてスタイルを設定
    if (type === 'error') {
      messageDiv.style.backgroundColor = '#f8d7da';
      messageDiv.style.color = '#721c24';
      messageDiv.style.border = '1px solid #f5c6cb';
    } else if (type === 'success') {
      messageDiv.style.backgroundColor = '#d4edda';
      messageDiv.style.color = '#155724';
      messageDiv.style.border = '1px solid #c3e6cb';
    } else {
      messageDiv.style.backgroundColor = '#cce7ff';
      messageDiv.style.color = '#004085';
      messageDiv.style.border = '1px solid #b3d7ff';
    }

    // 既存のメッセージを削除
    const existingMessage = document.querySelector('.temp-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // メッセージをクエリUIの上に挿入
    const queryUI = document.getElementById('query-ui');
    if (queryUI && queryUI.parentNode) {
      queryUI.parentNode.insertBefore(messageDiv, queryUI);
    } else {
      document.body.insertBefore(messageDiv, document.body.firstChild);
    }

    // 5秒後に自動削除
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  };

  /**
   * アプリ一覧を表示
   */
  const displayAppList = (apps, inputElement) => {
    // 既存のリストを削除
    const existingList = document.getElementById('app-list-container');
    if (existingList) {
      existingList.remove();
    }

    const listContainer = document.createElement('div');
    listContainer.id = 'app-list-container';
    listContainer.style.position = 'absolute';
    listContainer.style.backgroundColor = 'white';
    listContainer.style.border = '1px solid #ccc';
    listContainer.style.borderRadius = '4px';
    listContainer.style.maxHeight = '300px';
    listContainer.style.overflowY = 'auto';
    listContainer.style.zIndex = '1000';
    listContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

    const listTitle = document.createElement('h4');
    listTitle.textContent = `アプリ一覧 (${apps.length}件)`;
    listTitle.style.margin = '0';
    listTitle.style.padding = '10px';
    listTitle.style.backgroundColor = '#f0f8ff';
    listTitle.style.borderBottom = '1px solid #ddd';

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.right = '10px';
    closeButton.style.top = '8px';
    closeButton.style.border = 'none';
    closeButton.style.background = 'none';
    closeButton.style.fontSize = '18px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#999';
    closeButton.onclick = () => {
      listContainer.remove();
    };

    listTitle.appendChild(closeButton);
    listContainer.appendChild(listTitle);

    // アプリをリスト表示
    apps.forEach(app => {
      const appItem = document.createElement('div');
      appItem.style.padding = '10px';
      appItem.style.borderBottom = '1px solid #eee';
      appItem.style.cursor = 'pointer';
      appItem.style.backgroundColor = '#f8f9fa';
      appItem.style.display = 'flex';
      appItem.style.justifyContent = 'space-between';
      appItem.style.alignItems = 'center';

      const appInfo = document.createElement('span');
      appInfo.innerHTML = `<strong>${app.name}</strong> <small style="color: #6c757d;">(ID: ${app.appId})</small>`;
      appItem.appendChild(appInfo);

      const selectButton = document.createElement('button');
      selectButton.textContent = '選択';
      selectButton.style.padding = '4px 8px';
      selectButton.style.backgroundColor = '#007bff';
      selectButton.style.color = 'white';
      selectButton.style.border = 'none';
      selectButton.style.borderRadius = '3px';
      selectButton.style.cursor = 'pointer';
      selectButton.style.fontSize = '12px';

      selectButton.onclick = (e) => {
        e.stopPropagation();
        inputElement.value = app.name;
        listContainer.remove();
        showMessage(`アプリ "${app.name}" が選択されました`, 'success');
      };

      appItem.appendChild(selectButton);

      // アイテム全体をクリックしても選択可能
      appItem.onclick = () => {
        inputElement.value = app.name;
        listContainer.remove();
        showMessage(`アプリ "${app.name}" が選択されました`, 'success');
      };

      // ホバー効果
      appItem.onmouseover = () => {
        appItem.style.backgroundColor = '#e2e6ea';
      };
      appItem.onmouseout = () => {
        appItem.style.backgroundColor = '#f8f9fa';
      };

      listContainer.appendChild(appItem);
    });

    // クエリUIの後に追加
    const queryUI = document.getElementById('query-ui');
    if (queryUI && queryUI.parentNode) {
      queryUI.parentNode.insertBefore(listContainer, queryUI.nextSibling);
    }
  };

  /**
   * HTMLテーブルとしてスキーマを表示（オプション詳細付き）
   */
  const displaySchemaTable = (formattedSchema, containerElement) => {
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.border = '1px solid #ddd';
    table.style.marginBottom = '20px';
    table.style.tableLayout = 'fixed'; // カラムリサイズのために必要

    // ヘッダー行を作成
    const headerRow = document.createElement('tr');
    headerRow.style.backgroundColor = '#f0f8ff';

    // 各カラムのヘッダーを個別に作成
    const headers = [
      { text: 'フィールドコード', width: '200px' },
      { text: 'フィールド名', width: '250px' },
      { text: 'タイプ', width: '150px' },
      { text: '必須', width: '80px' },
      { text: '説明', width: '250px' },
      { text: 'オプション詳細', width: 'auto' }
    ];

    headers.forEach((headerInfo, index) => {
      const th = document.createElement('th');
      th.textContent = headerInfo.text;
      th.style.border = '1px solid #ddd';
      th.style.padding = '8px';
      th.style.textAlign = 'left';
      th.style.backgroundColor = '#f0f8ff';
      th.style.fontWeight = 'bold';
      th.style.overflow = 'hidden';
      th.style.whiteSpace = 'nowrap';
      th.style.textOverflow = 'ellipsis';

      if (headerInfo.width !== 'auto') {
        th.style.width = headerInfo.width;
      }

      headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    // データ行を作成
    formattedSchema.forEach(field => {
      const row = document.createElement('tr');

      // フィールドコード
      const codeCell = document.createElement('td');
      codeCell.textContent = field.code;
      codeCell.style.border = '1px solid #ddd';
      codeCell.style.padding = '8px';
      codeCell.style.fontFamily = 'monospace';
      codeCell.style.fontSize = '12px';
      codeCell.style.overflow = 'hidden';
      codeCell.style.whiteSpace = 'nowrap';
      codeCell.style.textOverflow = 'ellipsis';
      codeCell.title = field.code; // ツールチップで全文表示

      // フィールド名
      const labelCell = document.createElement('td');
      labelCell.textContent = field.label;
      labelCell.style.border = '1px solid #ddd';
      labelCell.style.padding = '8px';
      labelCell.style.fontWeight = 'bold';
      labelCell.style.overflow = 'hidden';
      labelCell.style.whiteSpace = 'nowrap';
      labelCell.style.textOverflow = 'ellipsis';
      labelCell.title = field.label;

      // タイプ
      const typeCell = document.createElement('td');
      typeCell.textContent = field.type;
      typeCell.style.border = '1px solid #ddd';
      typeCell.style.padding = '8px';
      typeCell.style.color = '#0066cc';
      typeCell.style.overflow = 'hidden';
      typeCell.style.whiteSpace = 'nowrap';
      typeCell.style.textOverflow = 'ellipsis';
      typeCell.title = field.type;

      // 必須
      const requiredCell = document.createElement('td');
      requiredCell.textContent = field.required;
      requiredCell.style.border = '1px solid #ddd';
      requiredCell.style.padding = '8px';
      requiredCell.style.textAlign = 'center';
      requiredCell.style.overflow = 'hidden';

      // 説明
      const descCell = document.createElement('td');
      descCell.textContent = field.description;
      descCell.style.border = '1px solid #ddd';
      descCell.style.padding = '8px';
      descCell.style.fontSize = '12px';
      descCell.style.wordWrap = 'break-word';
      descCell.style.overflow = 'hidden';
      descCell.title = field.description; // ツールチップで全文表示

      // オプション詳細
      const optionCell = document.createElement('td');
      const optionDetails = generateOptionDetails(field);
      optionCell.textContent = optionDetails;
      optionCell.style.border = '1px solid #ddd';
      optionCell.style.padding = '8px';
      optionCell.style.fontSize = '11px';
      optionCell.style.wordWrap = 'break-word';
      optionCell.style.overflow = 'hidden';
      optionCell.style.color = '#666';
      optionCell.title = optionDetails; // ツールチップで全文表示

      row.appendChild(codeCell);
      row.appendChild(labelCell);
      row.appendChild(typeCell);
      row.appendChild(requiredCell);
      row.appendChild(descCell);
      row.appendChild(optionCell);

      table.appendChild(row);

      // サブフィールドがある場合は追加行として表示
      if (field.subFields.length > 0) {
        field.subFields.forEach(subField => {
          const subRow = document.createElement('tr');
          subRow.style.backgroundColor = '#f9f9f9';

          // サブフィールドコード
          const subCodeCell = document.createElement('td');
          subCodeCell.textContent = `└ ${subField.code}`;
          subCodeCell.style.border = '1px solid #ddd';
          subCodeCell.style.padding = '8px';
          subCodeCell.style.paddingLeft = '20px';
          subCodeCell.style.fontFamily = 'monospace';
          subCodeCell.style.fontSize = '11px';
          subCodeCell.style.color = '#666';
          subCodeCell.style.overflow = 'hidden';
          subCodeCell.style.whiteSpace = 'nowrap';
          subCodeCell.style.textOverflow = 'ellipsis';
          subCodeCell.title = subField.code;

          // サブフィールド名
          const subLabelCell = document.createElement('td');
          subLabelCell.textContent = subField.label;
          subLabelCell.style.border = '1px solid #ddd';
          subLabelCell.style.padding = '8px';
          subLabelCell.style.paddingLeft = '20px';
          subLabelCell.style.color = '#666';
          subLabelCell.style.fontSize = '12px';
          subLabelCell.style.overflow = 'hidden';
          subLabelCell.style.whiteSpace = 'nowrap';
          subLabelCell.style.textOverflow = 'ellipsis';
          subLabelCell.title = subField.label;

          // サブタイプ
          const subTypeCell = document.createElement('td');
          subTypeCell.textContent = subField.type;
          subTypeCell.style.border = '1px solid #ddd';
          subTypeCell.style.padding = '8px';
          subTypeCell.style.color = '#0066cc';
          subTypeCell.style.fontSize = '12px';
          subTypeCell.style.overflow = 'hidden';
          subTypeCell.style.whiteSpace = 'nowrap';
          subTypeCell.style.textOverflow = 'ellipsis';
          subTypeCell.title = subField.type;

          // サブ必須
          const subRequiredCell = document.createElement('td');
          subRequiredCell.textContent = subField.required;
          subRequiredCell.style.border = '1px solid #ddd';
          subRequiredCell.style.padding = '8px';
          subRequiredCell.style.textAlign = 'center';
          subRequiredCell.style.fontSize = '12px';

          // サブ説明
          const subDescCell = document.createElement('td');
          subDescCell.textContent = subField.description;
          subDescCell.style.border = '1px solid #ddd';
          subDescCell.style.padding = '8px';
          subDescCell.style.fontSize = '11px';
          subDescCell.style.color = '#666';
          subDescCell.style.wordWrap = 'break-word';
          subDescCell.style.overflow = 'hidden';
          subDescCell.title = subField.description;

          // サブオプション詳細
          const subOptionCell = document.createElement('td');
          const subOptionDetails = generateOptionDetails(subField);
          subOptionCell.textContent = subOptionDetails;
          subOptionCell.style.border = '1px solid #ddd';
          subOptionCell.style.padding = '8px';
          subOptionCell.style.fontSize = '10px';
          subOptionCell.style.color = '#999';
          subOptionCell.style.wordWrap = 'break-word';
          subOptionCell.style.overflow = 'hidden';
          subOptionCell.title = subOptionDetails;

          subRow.appendChild(subCodeCell);
          subRow.appendChild(subLabelCell);
          subRow.appendChild(subTypeCell);
          subRow.appendChild(subRequiredCell);
          subRow.appendChild(subDescCell);
          subRow.appendChild(subOptionCell);

          table.appendChild(subRow);
        });
      }
    });

    // テーブルをコンテナに追加
    containerElement.appendChild(table);

    // リサイズ機能を有効化
    makeTableResizable(table);
  };

  /**
   * HTMLテーブルとしてレコードデータを表示
   */
  const displayRecordTable = (records, schema, containerElement) => {
    if (records.length === 0) {
      const noDataMessage = document.createElement('p');
      noDataMessage.textContent = 'レコードが見つかりませんでした。';
      containerElement.appendChild(noDataMessage);
      return;
    }

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginBottom = '20px';
    table.style.border = '1px solid #ddd';
    table.style.tableLayout = 'fixed'; // リサイズを有効化

    // ヘッダー行
    const headerRow = document.createElement('tr');
    headerRow.style.backgroundColor = '#f0f8ff';

    // レコードIDヘッダー
    const idHeader = document.createElement('th');
    idHeader.textContent = 'レコードID';
    idHeader.style.border = '1px solid #ddd';
    idHeader.style.padding = '8px';
    idHeader.style.textAlign = 'left';
    headerRow.appendChild(idHeader);

    // フィールドヘッダー
    Object.keys(schema).forEach(fieldCode => {
      const field = schema[fieldCode];
      if (!['SPACER', 'HR', 'LABEL', 'GROUP'].includes(field.type)) {
        const th = document.createElement('th');
        th.textContent = `${field.label}\n(${fieldCode})`;
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.textAlign = 'left';
        th.style.whiteSpace = 'pre-line';
        th.style.fontSize = '12px';
        headerRow.appendChild(th);
      }
    });
    table.appendChild(headerRow);

    // データ行
    records.forEach(record => {
      const row = document.createElement('tr');

      // レコードIDセル
      const idCell = document.createElement('td');
      idCell.textContent = record.recordId;
      idCell.style.border = '1px solid #ddd';
      idCell.style.padding = '8px';
      idCell.style.fontFamily = 'monospace';
      idCell.style.backgroundColor = '#f8f8f8';
      row.appendChild(idCell);

      // フィールドセル
      Object.keys(schema).forEach(fieldCode => {
        const field = schema[fieldCode];
        if (!['SPACER', 'HR', 'LABEL', 'GROUP'].includes(field.type)) {
          const cell = document.createElement('td');
          cell.style.border = '1px solid #ddd';
          cell.style.padding = '8px';
          cell.style.maxWidth = '200px';
          cell.style.overflow = 'auto';
          cell.style.verticalAlign = 'top';

          const value = record[fieldCode];
          let cellContent = '';

          if (field.type === 'SUBTABLE') {
            cellContent = `[テーブル: ${value ? value.length : 0}行]`;
            cell.textContent = cellContent;
            cell.style.color = '#0066cc';
            cell.style.fontStyle = 'italic';
            cell.style.whiteSpace = 'pre-line';
            cell.style.fontSize = '12px';
          } else if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
              cellContent = value.join(', ');
              cell.textContent = cellContent;
              cell.style.whiteSpace = 'pre-line';
              cell.style.fontSize = '12px';
            } else {
              cellContent = String(value);
              cell.textContent = cellContent;
              cell.style.whiteSpace = 'pre-line';
              cell.style.fontSize = '12px';
            }
          } else {
            cellContent = '-';
            cell.textContent = cellContent;
            cell.style.whiteSpace = 'pre-line';
            cell.style.fontSize = '12px';
            cell.style.color = '#999';
          }

          row.appendChild(cell);
        }
      });

      table.appendChild(row);
    });

    containerElement.appendChild(table);

    // リサイズ機能を有効化
    makeTableResizable(table);
  };

  // グローバル関数として公開
  window.UIHelpers = {
    showMessage,
    displayAppList,
    displaySchemaTable,
    displayRecordTable,
    makeTableResizable,
    updateAppNameCache,
    appNameCache // キャッシュも公開
  };

  console.log('UI ヘルパー スクリプトが読み込まれました');

})();
