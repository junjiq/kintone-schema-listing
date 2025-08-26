(() => {
  'use strict';

  /**
   * CSV出力機能
   * スキーマとレコードデータのCSVエクスポート機能を担当
   */

  /**
   * アプリ名をキャッシュから取得、なければ「アプリID: [ID]」を返す
   */
  const getAppDisplayName = (appId) => {
    // UIHelpersのキャッシュを参照
    if (window.UIHelpers && window.UIHelpers.appNameCache && window.UIHelpers.appNameCache[appId]) {
      return `${window.UIHelpers.appNameCache[appId]} (${appId})`;
    }
    return `アプリID: ${appId}`;
  };

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
      'フィールドコード',
      'フィールド名',
      'タイプ',
      '必須',
      'オプション詳細'
    ].join(','));

    // メインフィールドを処理
    console.log('schemaToCSV: スキーマ全体:', schema);
    console.log('schemaToCSV: フィールドタイプ一覧:', Object.keys(schema).map(code => `${code}: ${schema[code].type}`));

    // グループフィールドの存在確認
    const groupFields = Object.keys(schema).filter(code => schema[code].type === 'GROUP');
    console.log('schemaToCSV: グループフィールド一覧:', groupFields);
    if (groupFields.length > 0) {
      groupFields.forEach(code => {
        console.log(`schemaToCSV: グループフィールド ${code}:`, schema[code]);
      });
    } else {
      console.log('schemaToCSV: グループフィールドは存在しません');
    }

    Object.keys(schema).forEach(fieldCode => {
      const field = schema[fieldCode];

      // オプション詳細の生成
      let optionDetails = '';

                   // UIHelpersのテキスト版関数を使用してオプション詳細を生成
      optionDetails = window.UIHelpers.generateOptionDetailsText(field);



      // サブテーブル、グループ以外のフィールド
      if (field.type !== 'SUBTABLE' && field.type !== 'GROUP') {
        csvLines.push([
          `"${field.type === 'LABEL' ? '未定義' : fieldCode}"`,
          `"${field.type === 'LABEL' ? '未定義' : (field.label || '')}"`,
          `"${field.type}"`,
          `"${field.required ? 'はい' : 'いいえ'}"`,
          `"${optionDetails}"`
        ].join(','));
      } else if (field.type === 'GROUP') {
        // グループフィールドの場合
        console.log(`CSVエクスポート: グループフィールド ${fieldCode} を処理:`, field);
        console.log(`CSVエクスポート: field.fields:`, field.fields);
        console.log(`CSVエクスポート: field.fields の型:`, typeof field.fields);
        console.log(`CSVエクスポート: field.fields が配列か:`, Array.isArray(field.fields));
        const groupLines = GroupFieldProcessor.processGroupSchemaForCSV(field, fieldCode);
        console.log(`グループフィールド ${fieldCode} の処理結果:`, groupLines);
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
      if (!['SPACER', 'HR', 'SUBTABLE'].includes(field.type)) {
        if (field.type === 'GROUP' && field.fields) {
          // グループフィールドの場合、グループ内の各フィールドをヘッダーに追加
          const groupHeaderInfo = GroupFieldProcessor.getGroupHeadersForCSV(field, fieldCode);
          headers.push(...groupHeaderInfo.headers);
          fieldCodes.push(...groupHeaderInfo.fieldCodes);
        } else if (field.type === 'LABEL') {
          // ラベルフィールドの場合
          headers.push(`未定義(未定義)`);
          fieldCodes.push({ type: 'label', fieldCode: fieldCode });
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

          // グループ内のラベルフィールドの場合は特別処理
          const parentField = schema[fieldInfo.parentCode];
          if (parentField && parentField.fields && parentField.fields[fieldInfo.fieldCode]) {
            const groupField = parentField.fields[fieldInfo.fieldCode];
            if (groupField.type === 'LABEL') {
              cellContent = groupField.label || '';
            } else if (groupField.lookup) {
              // グループ内のルックアップフィールドの場合（lookupプロパティが設定されている場合）、ルックアップされた値を処理
              cellContent = value || '';
            }
          }
        } else if (fieldInfo.type === 'label') {
          // ラベルフィールドの場合
          const field = schema[fieldInfo.fieldCode];
          cellContent = field.label || '';
        } else {
          // 通常フィールドの場合
          value = record[fieldInfo.fieldCode];
        }

        if (fieldInfo.type !== 'label' && !(fieldInfo.type === 'group' && parentField && parentField.fields && parentField.fields[fieldInfo.fieldCode] && parentField.fields[fieldInfo.fieldCode].type === 'LABEL') && value !== null && value !== undefined && value !== '') {
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
