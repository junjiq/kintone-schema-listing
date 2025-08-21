(() => {
  'use strict';

  /**
   * UI関連のヘルパー関数
   * メッセージ表示、アプリ一覧表示、テーブル表示などのUI機能を担当
   */

  /**
   * メッセージ表示関数
   */
  const showMessage = (message, type = 'info') => {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.padding = '10px';
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.marginBottom = '10px';
    messageDiv.style.fontSize = '14px';

    if (type === 'success') {
      messageDiv.style.backgroundColor = '#d4edda';
      messageDiv.style.color = '#155724';
      messageDiv.style.border = '1px solid #c3e6cb';
    } else if (type === 'error') {
      messageDiv.style.backgroundColor = '#f8d7da';
      messageDiv.style.color = '#721c24';
      messageDiv.style.border = '1px solid #f5c6cb';
    } else {
      messageDiv.style.backgroundColor = '#d1ecf1';
      messageDiv.style.color = '#0c5460';
      messageDiv.style.border = '1px solid #bee5eb';
    }

    // 既存のメッセージを削除
    const existingMessage = document.querySelector('.temp-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    messageDiv.className = 'temp-message';
    const queryUI = document.getElementById('query-ui');
    if (queryUI) {
      queryUI.insertBefore(messageDiv, queryUI.children[1]); // タイトルの後に挿入

      // 5秒後に自動削除
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 5000);
    }
  };

  /**
   * アプリ一覧を表示
   */
  const displayAppList = (apps, inputElement) => {
    // 既存のアプリ一覧を削除
    const existingList = document.getElementById('app-list-container');
    if (existingList) {
      existingList.remove();
    }

    const listContainer = document.createElement('div');
    listContainer.id = 'app-list-container';
    listContainer.style.marginTop = '15px';
    listContainer.style.padding = '15px';
    listContainer.style.backgroundColor = '#ffffff';
    listContainer.style.border = '1px solid #dee2e6';
    listContainer.style.borderRadius = '5px';
    listContainer.style.maxHeight = '300px';
    listContainer.style.overflowY = 'auto';

    const listTitle = document.createElement('h4');
    listTitle.textContent = `スペース内のアプリ一覧（${apps.length}件）`;
    listTitle.style.margin = '0 0 10px 0';
    listTitle.style.color = '#495057';
    listTitle.style.fontSize = '16px';
    listContainer.appendChild(listTitle);

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.right = '10px';
    closeButton.style.top = '10px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#6c757d';
    closeButton.onclick = () => listContainer.remove();

    listContainer.style.position = 'relative';
    listContainer.appendChild(closeButton);

    apps.forEach(app => {
      const appItem = document.createElement('div');
      appItem.style.padding = '8px 12px';
      appItem.style.margin = '2px 0';
      appItem.style.backgroundColor = '#f8f9fa';
      appItem.style.border = '1px solid #e9ecef';
      appItem.style.borderRadius = '3px';
      appItem.style.cursor = 'pointer';
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
   * スキーマをHTMLテーブルとして表示
   */
  const displaySchemaTable = (formattedSchema, containerElement) => {
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.border = '1px solid #ddd';
    table.style.marginBottom = '20px';

    // ヘッダー行
    const headerRow = document.createElement('tr');
    headerRow.style.backgroundColor = '#f0f8ff';
    headerRow.innerHTML = `
      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">フィールドコード</th>
      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">フィールド名</th>
      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">タイプ</th>
      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">必須</th>
      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">説明</th>
    `;
    table.appendChild(headerRow);

    // データ行
    formattedSchema.forEach(field => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="border: 1px solid #ddd; padding: 8px; font-family: monospace; font-size: 12px;">${field.code}</td>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${field.label}</td>
        <td style="border: 1px solid #ddd; padding: 8px; color: #0066cc;">${field.type}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${field.required}</td>
        <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px; max-width: 200px; word-wrap: break-word;">${field.description}</td>
      `;
      table.appendChild(row);

      // サブフィールドがある場合は追加行として表示
      if (field.subFields.length > 0) {
        field.subFields.forEach(subField => {
          const subRow = document.createElement('tr');
          subRow.style.backgroundColor = '#f9f9f9';
          subRow.innerHTML = `
            <td style="border: 1px solid #ddd; padding: 8px; padding-left: 20px; font-family: monospace; font-size: 11px; color: #666;">└ ${subField.code}</td>
            <td style="border: 1px solid #ddd; padding: 8px; padding-left: 20px; color: #666; font-size: 12px;">${subField.label}</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #0066cc; font-size: 12px;">${subField.type}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 12px;">${subField.required}</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-size: 11px; color: #666; max-width: 200px; word-wrap: break-word;">${subField.description}</td>
          `;
          table.appendChild(subRow);
        });
      }
    });

    containerElement.appendChild(table);
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
  };

  // グローバル関数として公開
  window.UIHelpers = {
    showMessage,
    displayAppList,
    displaySchemaTable,
    displayRecordTable
  };

  console.log('UI ヘルパー スクリプトが読み込まれました');

})();
