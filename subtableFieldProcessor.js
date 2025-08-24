(() => {
  'use strict';

  /**
   * サブテーブルフィールド処理専用モジュール
   * サブテーブルフィールドに関する処理を集約し、コードの見通しを改善
   */

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
          code: subFieldCode,
          label: subField.label || subFieldCode,
          type: getFieldTypeLabel(subField.type),
          required: subField.required ? 'はい' : 'いいえ',
          description: subField.description || ''
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
          formattedRow[fieldCode] = row[fieldCode].value;
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
    console.log(`サブテーブルフィールド ${fieldCode} のフォーマット後:`, result);
    return result;
  };

  /**
   * CSV出力用：サブテーブルフィールドのスキーマ処理
   * @param {Object} field - サブテーブルフィールドのスキーマ
   * @param {string} fieldCode - フィールドコード
   * @returns {Array} CSV行の配列
   */
  const processSubtableSchemaForCSV = (field, fieldCode) => {
    const csvLines = [];

    // サブテーブルフィールド自体
    const subFieldCount = Object.keys(field.fields || {}).length;
    csvLines.push([
      '"メイン"',
      '""',
      `"${fieldCode}"`,
      `"${field.label || ''}"`,
      `"${field.type}"`,
      `"${field.required ? 'はい' : 'いいえ'}"`,
      `"${field.description || ''}"`,
      `"サブフィールド数: ${subFieldCount}"`
    ].join(','));

    // サブテーブル内のフィールドを処理
    if (field.fields) {
      Object.keys(field.fields).forEach(subFieldCode => {
        const subField = field.fields[subFieldCode];

        // サブフィールドのオプション詳細
        let subOptionDetails = '';
        if (subField.options) {
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
          '"サブテーブル"',
          `"${fieldCode}"`,
          `"${subFieldCode}"`,
          `"${subField.label || ''}"`,
          `"${subField.type}"`,
          `"${subField.required ? 'はい' : 'いいえ'}"`,
          `"${subField.description || ''}"`,
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

    // 各サブテーブルのCSV
    Object.keys(schema).forEach(fieldCode => {
      const field = schema[fieldCode];
      if (field.type === 'SUBTABLE' && field.fields) {
        const subCSVLines = [];

        // サブテーブルのヘッダー
        const subHeaders = ['親レコードID', '親レコード番号'];
        const subFieldCodes = [];

        Object.keys(field.fields).forEach(subFieldCode => {
          const subField = field.fields[subFieldCode];
          subHeaders.push(`${subField.label}(${subFieldCode})`);
          subFieldCodes.push(subFieldCode);
        });

        subCSVLines.push(subHeaders.map(h => `"${h}"`).join(','));

        // サブテーブルデータ
        records.forEach(record => {
          const subtableData = record[fieldCode];
          if (subtableData && Array.isArray(subtableData)) {
            subtableData.forEach(subRow => {
              const row = [`"${record.recordId}"`, `"${record.recordId}"`];

              subFieldCodes.forEach(subFieldCode => {
                const subValue = subRow[subFieldCode];
                let cellContent = '';

                if (subValue !== null && subValue !== undefined && subValue !== '') {
                  if (Array.isArray(subValue)) {
                    cellContent = subValue.join(', ');
                  } else {
                    cellContent = String(subValue);
                  }
                }

                // CSVエスケープ処理
                cellContent = cellContent.replace(/"/g, '""');
                row.push(`"${cellContent}"`);
              });

              subCSVLines.push(row.join(','));
            });
          }
        });

        // データがない場合のメッセージ
        if (subCSVLines.length === 1) {
          subCSVLines.push('"","","サブテーブルデータがありません"');
        }

        csvSections.push({
          title: `=== サブテーブル: ${field.label} (${fieldCode}) ===`,
          content: subCSVLines.join('\n')
        });
      }
    });

    return csvSections;
  };

  /**
   * サブテーブルフィールドが存在するかチェック
   * @param {Object} schema - スキーマオブジェクト
   * @returns {boolean} サブテーブルフィールドが存在するか
   */
  const hasSubtableFields = (schema) => {
    return Object.values(schema).some(field => field.type === 'SUBTABLE');
  };

  /**
   * サブテーブルフィールド数をカウント
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
