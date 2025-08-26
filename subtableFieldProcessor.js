(() => {
  'use strict';

  /**
   * サブテーブルフィールド処理専用モジュール
   * サブテーブルフィールドに関する処理を集約し、コードの見通しを改善
   */

  /**
   * アプリ名をキャッシュから取得、なければ「アプリID: [ID]」を返す
   */
  const getAppDisplayName = (appId) => {
    // UIHelpersのキャッシュを参照
      if (window.AppCache && window.AppCache.appNameCache && window.AppCache.appNameCache[appId]) {
    return `${window.AppCache.appNameCache[appId]} (${appId})`;
    }
    return `アプリID: ${appId}`;
  };

  /**
   * サブテーブルフィールドのスキーマを処理
   * @param {Object} field - サブテーブルフィールドのスキーマ
   * @param {string} fieldCode - フィールドコード
   * @param {Function} getFieldTypeLabel - フィールドタイプラベル取得関数
   * @returns {Array} サブテーブル内フィールドの配列
   */
  const processSubtableSchema = (field, fieldCode, getFieldTypeLabel) => {
    const subFields = [];

    if (field.type === 'SUBTABLE' && field.fields) {
      Object.keys(field.fields).forEach(subFieldCode => {
        const subField = field.fields[subFieldCode];
                 subFields.push({
           code: subField.type === 'LABEL' ? '未定義' : subFieldCode,
           label: subField.type === 'LABEL' ? '未定義' : (subField.label || subFieldCode),
           type: getFieldTypeLabel(subField.type),
           rawType: subField.type, // 元のフィールドタイプを保持
           required: subField.required ? 'はい' : 'いいえ',
           description: subField.description || '',
           options: subField.options || null, // オプション情報を保持
           expression: subField.expression || null, // 計算式を保持
           referenceTable: subField.referenceTable || null, // 関連レコード一覧情報を保持
           lookup: subField.lookup || null, // ルックアップ情報を保持
           defaultValue: subField.defaultValue || null, // 初期値情報を保持
           originalLabel: subField.label || '' // 元のラベル情報を保持（LABELフィールド用）
         });
      });
    }

    return subFields;
  };

  /**
   * サブテーブルデータを整理
   * @param {Array} subtableValue - サブテーブルの値
   * @returns {Array} 整理されたサブテーブルデータ
   */
  const formatSubtableData = (subtableValue) => {
    console.log('formatSubtableData called with:', subtableValue);

    if (!subtableValue || !Array.isArray(subtableValue)) {
      console.log('サブテーブルデータが配列ではありません:', subtableValue);
      return [];
    }

    const result = subtableValue.map(row => {
      console.log('サブテーブル行データ:', row);
      const formattedRow = {};
      Object.keys(row).forEach(fieldCode => {
        if (row[fieldCode] && row[fieldCode].value !== undefined) {
          // フィールド値の処理
          let fieldValue = row[fieldCode].value;

          // null値の処理
          if (fieldValue === null || fieldValue === undefined) {
            // ドロップダウンやラジオボタンなどの選択系フィールドの場合
            if (row[fieldCode].type === 'DROP_DOWN' ||
                row[fieldCode].type === 'RADIO_BUTTON' ||
                row[fieldCode].type === 'CHECK_BOX' ||
                row[fieldCode].type === 'MULTI_SELECT') {
              fieldValue = '(未選択)';
            } else {
              fieldValue = '';
            }
          }

          formattedRow[fieldCode] = fieldValue;
        } else if (row[fieldCode] !== undefined) {
          // valueプロパティがない場合は直接値を使用
          formattedRow[fieldCode] = row[fieldCode];
        }
      });
      console.log('フォーマット後の行データ:', formattedRow);
      return formattedRow;
    });

    console.log('formatSubtableData result:', result);
    return result;
  };

  /**
   * サブテーブルフィールドのレコードデータを処理
   * @param {Object} value - サブテーブルフィールドの値
   * @param {string} fieldCode - フィールドコード
   * @returns {Array} 処理されたサブテーブルデータ
   */
  const processSubtableRecordData = (value, fieldCode) => {
    console.log(`サブテーブルフィールド ${fieldCode} の生データ:`, value);
    const result = formatSubtableData(value.value);
    console.log(`サブテーブルフィールド ${fieldCode} の処理結果:`, result);
    return result;
  };

  /**
   * CSV出力用：サブテーブルフィールドのスキーマ処理
   * @param {Object} field - フィールドオブジェクト
   * @param {string} fieldCode - フィールドコード
   * @returns {Array} CSV行の配列
   */
  const processSubtableSchemaForCSV = (field, fieldCode) => {
    const csvLines = [];

    // サブテーブルフィールド自体
    const subFieldCount = Object.keys(field.fields || {}).length;
    csvLines.push([
      `"${fieldCode}"`,
      `"${field.label || ''}"`,
      `"${field.type}"`,
      `"${field.required ? 'はい' : 'いいえ'}"`,
      `"サブフィールド数: ${subFieldCount}"`
    ].join(','));

    // サブテーブル内のフィールドを処理
    if (field.fields) {
      Object.keys(field.fields).forEach(subFieldCode => {
        const subField = field.fields[subFieldCode];

        // サブフィールドのオプション詳細
        let subOptionDetails = '';

                 // ラベルフィールドの場合
         if (subField.type === 'LABEL') {
           subOptionDetails = `表示テキスト: ${subField.originalLabel || subField.label || ''}`;
         }
        // 計算フィールドの場合
        else if (subField.type === 'CALC') {
          if (subField.expression) {
            subOptionDetails = `計算式: ${subField.expression}`;
          } else {
            subOptionDetails = '計算フィールド';
          }
        }
        // 関連レコード一覧フィールドの場合
        else if (subField.type === 'REFERENCE_TABLE') {
          const details = [];
          if (subField.referenceTable && subField.referenceTable.relatedApp) {
            const appDisplayName = getAppDisplayName(subField.referenceTable.relatedApp.app);
            details.push(`関連アプリ: ${appDisplayName}`);
          }
          if (subField.referenceTable && subField.referenceTable.condition) {
            const formattedCondition = window.OptionDetails.formatReferenceTableCondition(subField.referenceTable.condition);
            details.push(`条件: ${formattedCondition}`);
          }
          if (subField.referenceTable && subField.referenceTable.filterCond) {
            const formattedFilter = window.OptionDetails.formatReferenceTableFilter(subField.referenceTable.filterCond);
            details.push(`絞り込み: ${formattedFilter}`);
          }
          if (subField.referenceTable && subField.referenceTable.displayFields) {
            const displayFieldCodes = subField.referenceTable.displayFields.join(', ');
            details.push(`表示フィールド: ${displayFieldCodes}`);
          }
          if (subField.referenceTable && subField.referenceTable.sort) {
            const formattedSort = window.OptionDetails.formatReferenceTableSort(subField.referenceTable.sort);
            details.push(`ソート: ${formattedSort}`);
          }
          subOptionDetails = details.length > 0 ? details.join('; ') : '関連レコード一覧';
        }
        // ルックアップフィールドの場合（lookupプロパティが設定されている場合）
        else if (subField.lookup) {
          const details = [];
          if (subField.lookup.relatedApp) {
            const appDisplayName = getAppDisplayName(subField.lookup.relatedApp.app);
            details.push(`参照アプリ: ${appDisplayName}`);
          }
          if (subField.lookup.relatedKeyField) {
            details.push(`参照キー: ${subField.lookup.relatedKeyField}`);
          }
          if (subField.lookup.fieldMappings) {
            const mappings = subField.lookup.fieldMappings.map(mapping =>
              `${mapping.field}→${mapping.relatedField}`
            );
            details.push(`フィールドマッピング: ${mappings.join(', ')}`);
          }
          if (subField.lookup.lookupPickerFields) {
            details.push(`検索対象: ${subField.lookup.lookupPickerFields.join(', ')}`);
          }
          if (subField.lookup.filterCond) {
            const formattedFilter = window.OptionDetails.formatReferenceTableFilter(subField.lookup.filterCond);
            details.push(`絞り込み: ${formattedFilter}`);
          }
          if (subField.lookup.sort) {
            const formattedSort = window.OptionDetails.formatReferenceTableSort(subField.lookup.sort);
            details.push(`ソート: ${formattedSort}`);
          }
          subOptionDetails = details.length > 0 ? details.join('; ') : 'ルックアップ';
        }
        // 選択肢型フィールドの場合
        else if (subField.options) {
          if (subField.type === 'DROP_DOWN' || subField.type === 'RADIO_BUTTON' ||
              subField.type === 'CHECK_BOX' || subField.type === 'MULTI_SELECT') {
            const subChoices = Object.keys(subField.options).map(key =>
              `${key}:${subField.options[key].label || subField.options[key]}`
            );
            subOptionDetails = subChoices.join('; ');
          } else {
            subOptionDetails = Object.keys(subField.options).map(key =>
              `${key}=${JSON.stringify(subField.options[key])}`
            ).join('; ');
          }
        }



        csvLines.push([
          `"${subField.type === 'LABEL' ? '未定義' : subFieldCode}"`,
          `"${subField.type === 'LABEL' ? '未定義' : (subField.label || '')}"`,
          `"${subField.type}"`,
          `"${subField.required ? 'はい' : 'いいえ'}"`,
          `"${subOptionDetails}"`
        ].join(','));
      });
    }

    return csvLines;
  };

  /**
   * CSV出力用：サブテーブル付きレコードデータの処理
   * @param {Array} records - レコードデータ配列
   * @param {Object} schema - スキーマオブジェクト
   * @returns {Array} CSV用セクション配列
   */
  const processSubtableRecordsForCSV = (records, schema) => {
    const csvSections = [];

    // サブテーブルフィールドを特定
    const subtableFields = Object.keys(schema).filter(fieldCode =>
      schema[fieldCode].type === 'SUBTABLE'
    );

    if (subtableFields.length === 0) {
      return csvSections;
    }

    subtableFields.forEach(fieldCode => {
      const field = schema[fieldCode];
      const sectionLines = [];

             // セクションヘッダー
       sectionLines.push(`サブテーブル: ${field.label || fieldCode}`);

      // サブテーブルのヘッダー行
      const subFieldCodes = Object.keys(field.fields || {});
      const headerRow = ['レコードID', ...subFieldCodes.map(code => {
        const subField = field.fields[code];
        return subField.type === 'LABEL' ? '未定義' : (subField.label || code);
      })];
      sectionLines.push(headerRow.map(h => `"${h}"`).join(','));

      // サブテーブルデータ行
      records.forEach(record => {
        const recordId = record['$id'] ? record['$id'].value : 'N/A';
        const subtableData = record[fieldCode];

        if (subtableData && Array.isArray(subtableData)) {
          subtableData.forEach(row => {
            const rowData = [recordId];
            subFieldCodes.forEach(subFieldCode => {
              const cellValue = row[subFieldCode];
              let displayValue = '';

              if (cellValue !== undefined && cellValue !== null) {
                if (typeof cellValue === 'object' && cellValue.value !== undefined) {
                  displayValue = cellValue.value;
                } else {
                  displayValue = cellValue;
                }
              }

              // 配列の場合は文字列に変換
              if (Array.isArray(displayValue)) {
                displayValue = displayValue.join('; ');
              }

              rowData.push(displayValue);
            });
            sectionLines.push(rowData.map(v => `"${v}"`).join(','));
          });
        }
      });

             csvSections.push(sectionLines.join('\n'));
    });

    return csvSections;
  };

  /**
   * スキーマにサブテーブルフィールドが含まれているかチェック
   * @param {Object} schema - スキーマオブジェクト
   * @returns {boolean} サブテーブルフィールドが存在する場合true
   */
  const hasSubtableFields = (schema) => {
    return Object.values(schema).some(field => field.type === 'SUBTABLE');
  };

  /**
   * スキーマ内のサブテーブルフィールド数を取得
   * @param {Object} schema - スキーマオブジェクト
   * @returns {number} サブテーブルフィールド数
   */
  const countSubtableFields = (schema) => {
    return Object.values(schema).filter(field => field.type === 'SUBTABLE').length;
  };

  /**
   * レコード内のサブテーブルデータの総行数を計算
   * @param {Array} records - レコードデータ配列
   * @param {Object} schema - スキーマオブジェクト
   * @returns {number} サブテーブルデータの総行数
   */
  const countSubtableRows = (records, schema) => {
    let totalRows = 0;

    Object.keys(schema).forEach(fieldCode => {
      const field = schema[fieldCode];
      if (field.type === 'SUBTABLE') {
        records.forEach(record => {
          const subtableData = record[fieldCode];
          if (subtableData && Array.isArray(subtableData)) {
            totalRows += subtableData.length;
          }
        });
      }
    });

    return totalRows;
  };

  // グローバル関数として公開
  window.SubtableFieldProcessor = {
    processSubtableSchema,
    formatSubtableData,
    processSubtableRecordData,
    processSubtableSchemaForCSV,
    processSubtableRecordsForCSV,
    hasSubtableFields,
    countSubtableFields,
    countSubtableRows
  };

  console.log('サブテーブルフィールドプロセッサー スクリプトが読み込まれました');

})();
