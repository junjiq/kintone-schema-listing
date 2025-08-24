(() => {
  'use strict';

  // サブテーブル表示専用スクリプト
  // Kintone JavaScript

  /**
   * サブテーブルを別テーブルとして表示する関数
   */
  window.displaySubtables = (records, schema, containerElement) => {
    console.log('displaySubtables 開始');
    console.log('records:', records);
    console.log('schema:', schema);
    console.log('containerElement:', containerElement);

    // サブテーブルフィールドを抽出
    const subtableFields = Object.keys(schema).filter(fieldCode => schema[fieldCode].type === 'SUBTABLE');
    console.log('サブテーブルフィールド:', subtableFields);

    if (subtableFields.length === 0) {
      console.log('サブテーブルが見つかりませんでした');
      return; // サブテーブルがない場合は何もしない
    }

    // 各サブテーブルフィールドについて処理
    subtableFields.forEach(subtableFieldCode => {
      const subtableField = schema[subtableFieldCode];

      // サブテーブルセクションのタイトル
      const subtableSection = document.createElement('div');
      subtableSection.style.marginTop = '30px';
      subtableSection.style.marginBottom = '20px';

      const subtableTitle = document.createElement('h4');
      subtableTitle.textContent = `サブテーブル: ${subtableField.label} (${subtableFieldCode})`;
      subtableTitle.style.color = '#0066cc';
      subtableTitle.style.borderBottom = '1px solid #0066cc';
      subtableTitle.style.paddingBottom = '5px';
      subtableTitle.style.marginBottom = '15px';
      subtableSection.appendChild(subtableTitle);

      // 各レコードのサブテーブルデータを収集
      let allSubtableRows = [];
      console.log(`サブテーブルフィールド ${subtableFieldCode} のデータ収集開始`);

      records.forEach((record, recordIndex) => {
        console.log(`レコード ${recordIndex}:`, record);
        const subtableData = record[subtableFieldCode];
        console.log(`サブテーブルデータ [${subtableFieldCode}]:`, subtableData);

        if (subtableData && Array.isArray(subtableData) && subtableData.length > 0) {
          console.log(`サブテーブルデータが存在: ${subtableData.length}行`);
          subtableData.forEach((row, rowIndex) => {
            console.log(`サブテーブル行 ${rowIndex}:`, row);
            allSubtableRows.push({
              ...row,
              _parentRecordId: record.recordId,
              _parentRecordIndex: recordIndex + 1
            });
          });
        } else {
          console.log(`レコード ${recordIndex} にはサブテーブルデータがありません`);
        }
      });

      console.log(`収集されたサブテーブル行数: ${allSubtableRows.length}`);
      console.log('収集されたサブテーブルデータ:', allSubtableRows);

      if (allSubtableRows.length === 0) {
        const noDataMessage = document.createElement('p');
        noDataMessage.textContent = 'このサブテーブルにはデータがありません。';
        noDataMessage.style.color = '#999';
        noDataMessage.style.fontStyle = 'italic';
        subtableSection.appendChild(noDataMessage);
        containerElement.appendChild(subtableSection);
        return;
      }

      // サブテーブル用のテーブル要素を作成
      console.log(`サブテーブル ${subtableFieldCode} のHTMLテーブル作成開始`);
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.border = '1px solid #ddd';
      table.style.fontSize = '12px';
      table.style.tableLayout = 'fixed'; // リサイズを有効化

      // サブテーブルのフィールド情報を取得
      const subFields = subtableField.fields || {};
      const subFieldCodes = Object.keys(subFields);
      console.log(`サブテーブルフィールド: ${subFieldCodes.length}個`, subFieldCodes);
      console.log('サブフィールド詳細:', subFields);

      // ヘッダー行を作成
      const headerRow = document.createElement('tr');
      headerRow.style.backgroundColor = '#f0f8ff';

      // 親レコードID列
      const parentIdHeader = document.createElement('th');
      parentIdHeader.textContent = '親レコード';
      parentIdHeader.style.border = '1px solid #ddd';
      parentIdHeader.style.padding = '8px';
      parentIdHeader.style.textAlign = 'left';
      parentIdHeader.style.backgroundColor = '#e6f3ff';
      headerRow.appendChild(parentIdHeader);

      // サブテーブルの各フィールド列
      subFieldCodes.forEach(subFieldCode => {
        const subField = subFields[subFieldCode];
        const th = document.createElement('th');
        th.textContent = `${subField.label}\n(${subFieldCode})`;
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.textAlign = 'left';
        th.style.whiteSpace = 'pre-line';
        th.style.fontSize = '11px';
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);

      // データ行を作成
      allSubtableRows.forEach((row, rowIndex) => {
        console.log(`行 ${rowIndex} 処理中:`, row);
        const tr = document.createElement('tr');
        tr.style.backgroundColor = rowIndex % 2 === 0 ? 'white' : '#f9f9f9';

        // 親レコードID列
        const parentIdCell = document.createElement('td');
        const parentRecordId = row._parentRecordId || 'N/A';
        const parentRecordIndex = row._parentRecordIndex || 'N/A';
        parentIdCell.textContent = `#${parentRecordIndex} (ID: ${parentRecordId})`;
        parentIdCell.style.border = '1px solid #ddd';
        parentIdCell.style.padding = '8px';
        parentIdCell.style.fontFamily = 'monospace';
        parentIdCell.style.fontSize = '10px';
        parentIdCell.style.backgroundColor = '#f8f8f8';
        tr.appendChild(parentIdCell);

        // サブテーブルの各フィールドデータ
        subFieldCodes.forEach(subFieldCode => {
          const td = document.createElement('td');
          td.style.border = '1px solid #ddd';
          td.style.padding = '8px';
          td.style.maxWidth = '200px';
          td.style.overflow = 'auto';
          td.style.verticalAlign = 'top';

          // サブテーブルデータの構造に対応: row.value[fieldCode] または row[fieldCode].value
          let cellValue = null;
          if (row.value && row.value[subFieldCode]) {
            // 構造: {id: 'xxx', value: {fieldCode: {value: 'data'}}}
            cellValue = row.value[subFieldCode].value || row.value[subFieldCode];
          } else if (row[subFieldCode]) {
            // 構造: {fieldCode: {value: 'data'}} または {fieldCode: 'data'}
            cellValue = row[subFieldCode].value || row[subFieldCode];
          }

          console.log(`フィールド ${subFieldCode} の値:`, cellValue);
          let cellContent = '';

          if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
            if (Array.isArray(cellValue)) {
              cellContent = cellValue.join(', ');
            } else {
              cellContent = String(cellValue);
            }
          } else {
            cellContent = '-';
            td.style.color = '#999';
          }

          td.textContent = cellContent;
          td.style.whiteSpace = 'pre-line';
          td.style.fontSize = '11px';
          tr.appendChild(td);
        });

        table.appendChild(tr);
      });

      subtableSection.appendChild(table);

      // リサイズ機能を有効化（UIHelpersのmakeTableResizable関数を使用）
      if (typeof window.UIHelpers !== 'undefined' && typeof window.UIHelpers.makeTableResizable === 'function') {
        window.UIHelpers.makeTableResizable(table);
        console.log(`サブテーブル ${subtableFieldCode} にリサイズ機能を適用しました`);
      } else {
        console.warn('UIHelpers.makeTableResizable が利用できません。uiHelpers.js を先に読み込んでください。');
      }

      // 統計情報を追加
      const statsDiv = document.createElement('div');
      statsDiv.style.marginTop = '10px';
      statsDiv.style.fontSize = '12px';
      statsDiv.style.color = '#666';

      const recordCount = new Set(allSubtableRows.map(row => row._parentRecordId)).size;
      statsDiv.textContent = `合計 ${allSubtableRows.length} 行（${recordCount} 個の親レコードから）`;
      subtableSection.appendChild(statsDiv);

      console.log(`サブテーブル ${subtableFieldCode} 統計: ${allSubtableRows.length}行, ${recordCount}親レコード`);
      console.log('サブテーブルセクションをコンテナに追加');
      containerElement.appendChild(subtableSection);
    });

    console.log('すべてのサブテーブル表示処理完了');
  };

  /**
   * サブテーブル表示機能の初期化
   */
  window.initSubtableDisplay = () => {
    console.log('サブテーブル表示機能が利用可能になりました');
  };

  // 初期化実行
  window.initSubtableDisplay();

  console.log('サブテーブル表示スクリプトが読み込まれました');

})();
