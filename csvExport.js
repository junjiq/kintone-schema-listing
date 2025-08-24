(() => {
  'use strict';

  /**
   * CSV出力機能
   * スキーマとレコードデータのCSVエクスポート機能を担当
   */

  /**
   * CSVファイルとしてダウンロード
   */
  const downloadCSV = (csvContent, filename) => {
    // BOMを追加してExcelで正しく表示されるようにする
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  /**
   * スキーマをCSV形式に変換（サブテーブル詳細対応）
   */
  const schemaToCSV = (schema) => {
    const csvLines = [];

    // CSVヘッダー
    csvLines.push([
      'レベル',
      '親フィールド',
      'フィールドコード',
      'フィールド名',
      'フィールドタイプ',
      '必須',
      '説明',
      'オプション詳細'
    ].join(','));

    // メインフィールドを処理
    Object.keys(schema).forEach(fieldCode => {
      const field = schema[fieldCode];

      // オプション詳細の生成
      let optionDetails = '';

      // 計算フィールドの場合
      if (field.type === 'CALC') {
        if (field.expression) {
          optionDetails = `計算式: ${field.expression}`;
        } else {
          optionDetails = '計算フィールド';
        }
      }
      // 関連レコード一覧フィールドの場合
      else if (field.type === 'REFERENCE_TABLE') {
        const details = [];
        if (field.referenceTable && field.referenceTable.relatedApp) {
          details.push(`関連アプリ: ${field.referenceTable.relatedApp.app}`);
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
      else if (field.type === 'LOOKUP') {
        const details = [];
        if (field.lookup && field.lookup.relatedApp) {
          details.push(`参照アプリ: ${field.lookup.relatedApp.app}`);
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
      // 選択肢型フィールドの場合
      else if (field.options) {
        if (field.type === 'DROP_DOWN' || field.type === 'RADIO_BUTTON' ||
            field.type === 'CHECK_BOX' || field.type === 'MULTI_SELECT') {
          // 選択肢型フィールドの場合
          const choices = Object.keys(field.options).map(key => `${key}:${field.options[key].label || field.options[key]}`);
          optionDetails = choices.join('; ');
        } else {
          // その他のオプション
          optionDetails = Object.keys(field.options).map(key => `${key}=${JSON.stringify(field.options[key])}`).join('; ');
        }
      }

      // サブテーブル、グループ以外のフィールド
      if (field.type !== 'SUBTABLE' && field.type !== 'GROUP') {
        csvLines.push([
          '"メイン"',
          '""',
          `"${fieldCode}"`,
          `"${field.label || ''}"`,
          `"${field.type}"`,
          `"${field.required ? 'はい' : 'いいえ'}"`,
          `"${field.description || ''}"`,
          `"${optionDetails}"`
        ].join(','));
      } else if (field.type === 'GROUP') {
        // グループフィールドの場合
        const groupLines = GroupFieldProcessor.processGroupSchemaForCSV(field, fieldCode);
        csvLines.push(...groupLines);
      } else {
        // サブテーブルフィールドの場合
        const subtableLines = SubtableFieldProcessor.processSubtableSchemaForCSV(field, fieldCode);
        csvLines.push(...subtableLines);
      }
    });

    return csvLines.join('\n');
  };  /**
   * サブテーブルデータを含むCSV形式に変換
   */
  const recordsWithSubtablesToCSV = (records, schema) => {
    if (!records || records.length === 0) {
      return 'データがありません';
    }

    const csvSections = [];

    // メインレコードのCSV
    const mainCSV = recordsToCSV(records, schema);
    csvSections.push('=== メインレコードデータ ===');
    csvSections.push(mainCSV);

    // 各サブテーブルのCSV
    const subtableSections = SubtableFieldProcessor.processSubtableRecordsForCSV(records, schema);
    subtableSections.forEach(section => {
      csvSections.push(''); // 空行
      csvSections.push(section.title);
      csvSections.push(section.content);
    });

    return csvSections.join('\n');
  };

  /**
   * レコードデータをCSV形式に変換（メインレコードのみ）
   */
  const recordsToCSV = (records, schema) => {
    if (!records || records.length === 0) {
      return 'データがありません';
    }

    const csvLines = [];

    // ヘッダー行を作成（レコードIDと通常フィールド、グループ内フィールドも含む）
    const headers = ['レコードID'];
    const fieldCodes = [];

    Object.keys(schema).forEach(fieldCode => {
      const field = schema[fieldCode];
      if (!['SPACER', 'HR', 'LABEL', 'SUBTABLE'].includes(field.type)) {
        if (field.type === 'GROUP' && field.fields) {
          // グループフィールドの場合、グループ内の各フィールドをヘッダーに追加
          const groupHeaderInfo = GroupFieldProcessor.getGroupHeadersForCSV(field, fieldCode);
          headers.push(...groupHeaderInfo.headers);
          fieldCodes.push(...groupHeaderInfo.fieldCodes);
        } else {
          headers.push(`${field.label}(${fieldCode})`);
          fieldCodes.push({ type: 'normal', fieldCode: fieldCode });
        }
      }
    });

    csvLines.push(headers.map(h => `"${h}"`).join(','));

    // データ行を作成
    records.forEach(record => {
      const row = [`"${record.recordId}"`];

      fieldCodes.forEach(fieldInfo => {
        let value;
        let cellContent = '';

        if (fieldInfo.type === 'group') {
          // グループ内フィールドの場合
          value = GroupFieldProcessor.getGroupValueForCSV(record, fieldInfo);
        } else {
          // 通常フィールドの場合
          value = record[fieldInfo.fieldCode];
        }

        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            cellContent = value.join(', ');
          } else {
            cellContent = String(value);
          }
        }

        // CSVエスケープ処理
        cellContent = cellContent.replace(/"/g, '""');
        row.push(`"${cellContent}"`);
      });

      csvLines.push(row.join(','));
    });

    return csvLines.join('\n');
  };

  /**
   * スキーマCSVエクスポート機能を追加
   */
  const addSchemaExportButton = (schema, appName, containerElement) => {
    const exportContainer = document.createElement('div');
    exportContainer.style.marginTop = '20px';
    exportContainer.style.padding = '15px';
    exportContainer.style.backgroundColor = '#f0f8ff';
    exportContainer.style.border = '1px solid #d0d0ff';
    exportContainer.style.borderRadius = '5px';

    const exportTitle = document.createElement('h3');
    exportTitle.textContent = 'スキーマエクスポート';
    exportTitle.style.margin = '0 0 10px 0';
    exportTitle.style.color = '#333';
    exportContainer.appendChild(exportTitle);

    const exportButton = document.createElement('button');
    exportButton.textContent = 'スキーマをCSVでダウンロード';
    exportButton.style.padding = '10px 20px';
    exportButton.style.backgroundColor = '#4CAF50';
    exportButton.style.color = 'white';
    exportButton.style.border = 'none';
    exportButton.style.borderRadius = '4px';
    exportButton.style.cursor = 'pointer';
    exportButton.style.fontSize = '14px';
    exportButton.style.marginRight = '10px';

    exportButton.onmouseover = () => {
      exportButton.style.backgroundColor = '#45a049';
    };
    exportButton.onmouseout = () => {
      exportButton.style.backgroundColor = '#4CAF50';
    };

    exportButton.onclick = () => {
      const csvContent = schemaToCSV(schema);
      const fileName = `${appName}_schema_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, fileName);
    };

    exportContainer.appendChild(exportButton);

    // スキーマ情報の概要を表示
    const summaryText = document.createElement('p');
    const totalFields = Object.keys(schema).length;
    const subtableFields = SubtableFieldProcessor.countSubtableFields(schema);
    const groupFields = GroupFieldProcessor.countGroupFields(schema);
    summaryText.textContent = `総フィールド数: ${totalFields} (サブテーブル: ${subtableFields}, グループ: ${groupFields})`;
    summaryText.style.margin = '10px 0 0 0';
    summaryText.style.fontSize = '12px';
    summaryText.style.color = '#666';
    exportContainer.appendChild(summaryText);

    containerElement.appendChild(exportContainer);
  };

  /**
   * レコードデータCSVエクスポート機能を追加
   */
  const addRecordExportButton = (records, schema, appName, containerElement) => {
    const exportContainer = document.createElement('div');
    exportContainer.style.marginTop = '20px';
    exportContainer.style.padding = '15px';
    exportContainer.style.backgroundColor = '#fff8f0';
    exportContainer.style.border = '1px solid #ffd0a0';
    exportContainer.style.borderRadius = '5px';

    const exportTitle = document.createElement('h3');
    exportTitle.textContent = 'レコードデータエクスポート';
    exportTitle.style.margin = '0 0 15px 0';
    exportTitle.style.color = '#333';
    exportContainer.appendChild(exportTitle);

    // メインレコードのみのエクスポートボタン
    const mainExportButton = document.createElement('button');
    mainExportButton.textContent = 'メインデータをCSVでダウンロード';
    mainExportButton.style.padding = '10px 20px';
    mainExportButton.style.backgroundColor = '#FF9800';
    mainExportButton.style.color = 'white';
    mainExportButton.style.border = 'none';
    mainExportButton.style.borderRadius = '4px';
    mainExportButton.style.cursor = 'pointer';
    mainExportButton.style.fontSize = '14px';
    mainExportButton.style.marginRight = '10px';
    mainExportButton.style.marginBottom = '10px';

    mainExportButton.onmouseover = () => {
      mainExportButton.style.backgroundColor = '#F57C00';
    };
    mainExportButton.onmouseout = () => {
      mainExportButton.style.backgroundColor = '#FF9800';
    };

    mainExportButton.onclick = () => {
      const csvContent = recordsToCSV(records, schema);
      const fileName = `${appName}_records_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, fileName);
    };

    exportContainer.appendChild(mainExportButton);

    // サブテーブルデータを含む完全エクスポートボタン
    const fullExportButton = document.createElement('button');
    fullExportButton.textContent = 'サブテーブル含む全データをCSVでダウンロード';
    fullExportButton.style.padding = '10px 20px';
    fullExportButton.style.backgroundColor = '#9C27B0';
    fullExportButton.style.color = 'white';
    fullExportButton.style.border = 'none';
    fullExportButton.style.borderRadius = '4px';
    fullExportButton.style.cursor = 'pointer';
    fullExportButton.style.fontSize = '14px';
    fullExportButton.style.marginRight = '10px';
    fullExportButton.style.marginBottom = '10px';

    fullExportButton.onmouseover = () => {
      fullExportButton.style.backgroundColor = '#7B1FA2';
    };
    fullExportButton.onmouseout = () => {
      fullExportButton.style.backgroundColor = '#9C27B0';
    };

    fullExportButton.onclick = () => {
      const csvContent = recordsWithSubtablesToCSV(records, schema);
      const fileName = `${appName}_full_records_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, fileName);
    };

    exportContainer.appendChild(fullExportButton);

    // 改行を追加
    const br = document.createElement('br');
    exportContainer.appendChild(br);

    // レコード情報の概要を表示
    const summaryText = document.createElement('p');
    const subtableCount = SubtableFieldProcessor.countSubtableFields(schema);
    const groupCount = GroupFieldProcessor.countGroupFields(schema);
    summaryText.innerHTML = `レコード件数: ${records.length}<br>` +
                          `サブテーブル数: ${subtableCount}<br>` +
                          `グループ数: ${groupCount}<br>` +
                          `<small>• メインデータ: レコードの基本情報（グループ内フィールド含む）<br>` +
                          `• 全データ: サブテーブルも別セクションとして含む</small>`;
    summaryText.style.margin = '10px 0 0 0';
    summaryText.style.fontSize = '12px';
    summaryText.style.color = '#666';
    exportContainer.appendChild(summaryText);

    containerElement.appendChild(exportContainer);
  };

  // グローバル関数として公開
  window.CSVExport = {
    downloadCSV,
    schemaToCSV,
    recordsToCSV,
    recordsWithSubtablesToCSV,
    addSchemaExportButton,
    addRecordExportButton
  };

  console.log('CSV出力 スクリプトが読み込まれました');

})();
