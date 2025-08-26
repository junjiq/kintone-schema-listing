(() => {
  'use strict';

  /**
   * UI関連のヘルパー関数
   * アプリ一覧表示、テーブル表示などのUI機能を担当
   */





  /**
   * アプリ一覧をポップアップウィンドウとして表示
   */
  const displayAppList = (apps, inputElement) => {
    // 既存のポップアップを削除
    const existingPopup = document.getElementById('app-list-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // ポップアップオーバーレイを作成
    const overlay = document.createElement('div');
    overlay.id = 'app-list-popup';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    // ポップアップコンテナを作成
    const popupContainer = document.createElement('div');
    popupContainer.style.backgroundColor = 'white';
    popupContainer.style.border = '1px solid #ccc';
    popupContainer.style.borderRadius = '8px';
    popupContainer.style.width = '600px';
    popupContainer.style.maxHeight = '80vh';
    popupContainer.style.overflowY = 'auto';
    popupContainer.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    popupContainer.style.position = 'relative';

    const listTitle = document.createElement('h4');
    listTitle.textContent = `アプリ一覧 (${apps.length}件)`;
    listTitle.style.margin = '0';
    listTitle.style.padding = '15px';
    listTitle.style.backgroundColor = '#f0f8ff';
    listTitle.style.borderBottom = '1px solid #ddd';
    listTitle.style.borderRadius = '8px 8px 0 0';
    listTitle.style.fontSize = '16px';
    listTitle.style.fontWeight = 'bold';

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.right = '15px';
    closeButton.style.top = '12px';
    closeButton.style.border = 'none';
    closeButton.style.background = 'none';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#999';
    closeButton.style.fontWeight = 'bold';
    closeButton.onclick = () => {
      overlay.remove();
    };

    listTitle.appendChild(closeButton);
    popupContainer.appendChild(listTitle);

    // アプリをリスト表示
    apps.forEach(app => {
      const appItem = document.createElement('div');
      appItem.style.padding = '12px 15px';
      appItem.style.borderBottom = '1px solid #eee';
      appItem.style.cursor = 'pointer';
      appItem.style.backgroundColor = '#f8f9fa';
      appItem.style.display = 'flex';
      appItem.style.justifyContent = 'space-between';
      appItem.style.alignItems = 'center';
      appItem.style.transition = 'background-color 0.2s ease';

      const appInfo = document.createElement('span');
      appInfo.innerHTML = `<strong>${app.name}</strong> <small style="color: #6c757d;">(ID: ${app.appId})</small>`;
      appItem.appendChild(appInfo);

      const selectButton = document.createElement('button');
      selectButton.textContent = '選択';
      selectButton.style.padding = '6px 12px';
      selectButton.style.backgroundColor = '#007bff';
      selectButton.style.color = 'white';
      selectButton.style.border = 'none';
      selectButton.style.borderRadius = '4px';
      selectButton.style.cursor = 'pointer';
      selectButton.style.fontSize = '13px';
      selectButton.style.fontWeight = 'bold';
      selectButton.style.transition = 'background-color 0.2s ease';

      selectButton.onmouseover = () => {
        selectButton.style.backgroundColor = '#0056b3';
      };
      selectButton.onmouseout = () => {
        selectButton.style.backgroundColor = '#007bff';
      };

      selectButton.onclick = (e) => {
        e.stopPropagation();
        inputElement.value = app.name;
        overlay.remove();
        window.MessageHelpers.showMessage(`アプリ "${app.name}" が選択されました`, 'success');
      };

      appItem.appendChild(selectButton);

      // アイテム全体をクリックしても選択可能
      appItem.onclick = () => {
        inputElement.value = app.name;
        overlay.remove();
        window.MessageHelpers.showMessage(`アプリ "${app.name}" が選択されました`, 'success');
      };

      // ホバー効果
      appItem.onmouseover = () => {
        appItem.style.backgroundColor = '#e2e6ea';
      };
      appItem.onmouseout = () => {
        appItem.style.backgroundColor = '#f8f9fa';
      };

      popupContainer.appendChild(appItem);
    });

    // オーバーレイにポップアップコンテナを追加
    overlay.appendChild(popupContainer);

    // オーバーレイクリックでポップアップを閉じる
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    };

    // ESCキーでポップアップを閉じる
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', handleEscKey);
      }
    };
    document.addEventListener('keydown', handleEscKey);

    // bodyにオーバーレイを追加
    document.body.appendChild(overlay);
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
       codeCell.style.fontWeight = 'bold';
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



             // オプション詳細
       const optionCell = document.createElement('td');
       const optionDetails = window.OptionDetails.generateOptionDetails(field);
       optionCell.innerHTML = optionDetails;
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



                     // サブオプション詳細
           const subOptionCell = document.createElement('td');
           const subOptionDetails = window.OptionDetails.generateOptionDetails(subField);
           subOptionCell.innerHTML = subOptionDetails;
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
          subRow.appendChild(subOptionCell);

          table.appendChild(subRow);
        });
      }
    });

         // テーブルをコンテナに追加
     containerElement.appendChild(table);

     // リサイズ機能を有効化
     window.TableHelpers.makeTableResizable(table);
  };

  /**
   * 画面をリセット
   */
  const resetDisplay = () => {
    const resultContainer = document.getElementById('query-result');
    if (resultContainer) {
      resultContainer.innerHTML = '';
    }

    // アプリ一覧表示エリアもクリア
    const appListContainer = document.getElementById('app-list-container');
    if (appListContainer) {
      appListContainer.remove();
    }
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
      if (!['SPACER', 'HR'].includes(field.type)) {
        if (field.type === 'GROUP' && field.fields) {
          // グループフィールドの場合、グループ内の各フィールドをヘッダーに追加
          Object.keys(field.fields).forEach(groupFieldCode => {
            const groupField = field.fields[groupFieldCode];
            if (!['SPACER', 'HR'].includes(groupField.type)) {
              const th = document.createElement('th');

              // フィールドコードとラベルの設定
              let groupFieldLabel = groupField.label || groupFieldCode;
              let groupFieldCodeDisplay = groupFieldCode;

              // LABELフィールドの場合は特別処理
              if (groupField.type === 'LABEL') {
                groupFieldLabel = 'FN未定義';
                groupFieldCodeDisplay = 'FC未定義';
              }

              th.textContent = `${field.label}/${groupFieldLabel}\n(${groupFieldCodeDisplay})`;
              th.style.border = '1px solid #ddd';
              th.style.padding = '8px';
              th.style.textAlign = 'left';
              th.style.whiteSpace = 'pre-line';
              th.style.fontSize = '12px';
              th.style.backgroundColor = '#f0f8ff';
              headerRow.appendChild(th);
            }
          });
        } else {
          const th = document.createElement('th');

          // フィールドコードとラベルの設定
          let fieldLabel = field.label || fieldCode;
          let fieldCodeDisplay = fieldCode;

          // LABELフィールドの場合は特別処理
          if (field.type === 'LABEL') {
            fieldLabel = 'FN未定義';
            fieldCodeDisplay = 'FC未定義';
          }

          th.textContent = `${fieldLabel}\n(${fieldCodeDisplay})`;
          th.style.border = '1px solid #ddd';
          th.style.padding = '8px';
          th.style.textAlign = 'left';
          th.style.whiteSpace = 'pre-line';
          th.style.fontSize = '12px';
          headerRow.appendChild(th);
        }
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
        if (!['SPACER', 'HR'].includes(field.type)) {
          if (field.type === 'GROUP' && field.fields) {
            // グループフィールドの場合、グループ内の各フィールドをセルに追加
            Object.keys(field.fields).forEach(groupFieldCode => {
              const groupField = field.fields[groupFieldCode];
              if (!['SPACER', 'HR'].includes(groupField.type)) {
                const cell = document.createElement('td');
                cell.style.border = '1px solid #ddd';
                cell.style.padding = '8px';
                cell.style.maxWidth = '200px';
                cell.style.overflow = 'auto';
                cell.style.verticalAlign = 'top';
                cell.style.backgroundColor = '#f9f9f9';

                const value = record[groupFieldCode];
                let cellContent = '';

                if (groupField.type === 'LABEL') {
                  cellContent = groupField.label || 'FN未定義';
                  cell.textContent = cellContent;
                  cell.style.color = '#666';
                  cell.style.fontStyle = 'italic';
                  cell.style.whiteSpace = 'pre-line';
                  cell.style.fontSize = '12px';
                                 } else if (value !== null && value !== undefined && value !== '') {
                   if (Array.isArray(value)) {
                     cellContent = value.join(', ');
                     cell.textContent = cellContent;
                     cell.style.whiteSpace = 'pre-line';
                     cell.style.fontSize = '12px';
                   } else if (typeof value === 'object' && value !== null) {
                     // システムフィールド（更新者、作成者など）の処理
                     if (groupField.type === 'MODIFIER' || groupField.type === 'CREATOR') {
                       cellContent = value.name || value.code || JSON.stringify(value);
                     } else if (groupField.type === 'UPDATED_TIME' || groupField.type === 'CREATED_TIME') {
                       cellContent = value.value || String(value);
                     } else {
                       cellContent = JSON.stringify(value);
                     }
                     cell.textContent = cellContent;
                     cell.style.whiteSpace = 'pre-line';
                     cell.style.fontSize = '12px';
                   } else {
                     cellContent = String(value);
                     // リッチエディターの場合、HTMLをレンダリング
                     if (groupField.type === 'RICH_TEXT' && cellContent.includes('<')) {
                       cell.innerHTML = cellContent;
                       cell.style.whiteSpace = 'pre-line';
                       cell.style.fontSize = '12px';
                     } else {
                       cell.textContent = cellContent;
                       cell.style.whiteSpace = 'pre-line';
                       cell.style.fontSize = '12px';
                     }
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
          } else {
            const cell = document.createElement('td');
            cell.style.border = '1px solid #ddd';
            cell.style.padding = '8px';
            cell.style.maxWidth = '200px';
            cell.style.overflow = 'auto';
            cell.style.verticalAlign = 'top';

            const value = record[fieldCode];
            let cellContent = '';

            if (field.type === 'LABEL') {
              cellContent = field.label || '';
              cell.textContent = cellContent;
              cell.style.color = '#666';
              cell.style.fontStyle = 'italic';
              cell.style.whiteSpace = 'pre-line';
              cell.style.fontSize = '12px';
              cell.style.backgroundColor = '#f9f9f9';
            } else if (field.type === 'SUBTABLE') {
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
                 } else if (typeof value === 'object' && value !== null) {
                   // システムフィールド（更新者、作成者など）の処理
                   if (field.type === 'MODIFIER' || field.type === 'CREATOR') {
                     cellContent = value.name || value.code || JSON.stringify(value);
                   } else if (field.type === 'UPDATED_TIME' || field.type === 'CREATED_TIME') {
                     cellContent = value.value || String(value);
                   } else {
                     cellContent = JSON.stringify(value);
                   }
                   cell.textContent = cellContent;
                   cell.style.whiteSpace = 'pre-line';
                   cell.style.fontSize = '12px';
                 } else {
                   cellContent = String(value);
                   // リッチエディターの場合、HTMLをレンダリング
                   if (field.type === 'RICH_TEXT' && cellContent.includes('<')) {
                     cell.innerHTML = cellContent;
                     cell.style.whiteSpace = 'pre-line';
                     cell.style.fontSize = '12px';
                   } else {
                     cell.textContent = cellContent;
                     cell.style.whiteSpace = 'pre-line';
                     cell.style.fontSize = '12px';
                   }
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
        }
      });

      table.appendChild(row);
    });

         containerElement.appendChild(table);

     // リサイズ機能を有効化
     window.TableHelpers.makeTableResizable(table);
  };

     // グローバル関数として公開
   window.UIHelpers = {
     displayAppList,
     displaySchemaTable,
     displayRecordTable,
     resetDisplay
   };

  console.log('UI ヘルパー スクリプトが読み込まれました');

})();
