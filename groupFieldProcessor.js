(() => {
  'use strict';

  /**
   * グループフィールド処理専用モジュール
   * グループフィールドに関する処理を集約し、コードの見通しを改善
   */

  /**
   * グループフィールドのスキーマを処理
   * @param {Object} field - グループフィールドのスキーマ
   * @param {string} fieldCode - フィールドコード
   * @param {Function} getFieldTypeLabel - フィールドタイプラベル取得関数
   * @returns {Array} グループ内フィールドの配列
   */
  const processGroupSchema = (field, fieldCode, getFieldTypeLabel) => {
    const subFields = [];

    if (field.type === 'GROUP' && field.fields) {
      Object.keys(field.fields).forEach(groupFieldCode => {
        const groupField = field.fields[groupFieldCode];
        subFields.push({
          code: groupFieldCode,
          label: groupField.label || groupFieldCode,
          type: getFieldTypeLabel(groupField.type),
          rawType: groupField.type, // 元のフィールドタイプを保持
          required: groupField.required ? 'はい' : 'いいえ',
          description: groupField.description || '',
          options: groupField.options || null // オプション情報を保持
        });
      });
    }

    return subFields;
  };

  /**
   * グループフィールドのレコードデータを処理
   * @param {Object} record - レコードデータ
   * @param {Object} field - グループフィールドのスキーマ
   * @param {string} fieldCode - フィールドコード
   * @returns {Object} 処理されたグループデータ
   */
  const processGroupRecordData = (record, field, fieldCode) => {
    const groupData = {};

    if (field.fields) {
      Object.keys(field.fields).forEach(groupFieldCode => {
        const groupFieldValue = record[groupFieldCode];
        if (groupFieldValue) {
          const groupField = field.fields[groupFieldCode];
          groupData[groupFieldCode] = formatGroupFieldValue(groupFieldValue, groupField);
        } else {
          groupData[groupFieldCode] = null;
        }
      });
    }

    return groupData;
  };

  /**
   * グループ内フィールドの値をフォーマット
   * @param {Object} value - フィールドの値
   * @param {Object} fieldSchema - フィールドのスキーマ
   * @returns {*} フォーマット済みの値
   */
  const formatGroupFieldValue = (value, fieldSchema) => {
    if (fieldSchema.type === 'USER_SELECT' ||
        fieldSchema.type === 'ORGANIZATION_SELECT' ||
        fieldSchema.type === 'GROUP_SELECT') {
      return value.value.map(item => item.name || item.code);
    } else if (fieldSchema.type === 'FILE') {
      return value.value.map(file => file.name);
    } else if (fieldSchema.type === 'CHECK_BOX' ||
               fieldSchema.type === 'MULTI_SELECT') {
      return value.value;
    } else {
      return value.value;
    }
  };

  /**
   * CSV出力用：グループフィールドのスキーマ処理
   * @param {Object} field - グループフィールドのスキーマ
   * @param {string} fieldCode - フィールドコード
   * @returns {Array} CSV行の配列
   */
  const processGroupSchemaForCSV = (field, fieldCode) => {
    const csvLines = [];

    // グループフィールド自体
    const groupFieldCount = Object.keys(field.fields || {}).length;
    csvLines.push([
      '"メイン"',
      '""',
      `"${fieldCode}"`,
      `"${field.label || ''}"`,
      `"${field.type}"`,
      `"${field.required ? 'はい' : 'いいえ'}"`,
      `"${field.description || ''}"`,
      `"グループ内フィールド数: ${groupFieldCount}"`
    ].join(','));

    // グループ内のフィールドを処理
    if (field.fields) {
      Object.keys(field.fields).forEach(groupFieldCode => {
        const groupField = field.fields[groupFieldCode];

        // グループ内フィールドのオプション詳細
        let groupOptionDetails = '';
        if (groupField.options) {
          if (groupField.type === 'DROP_DOWN' || groupField.type === 'RADIO_BUTTON' ||
              groupField.type === 'CHECK_BOX' || groupField.type === 'MULTI_SELECT') {
            const groupChoices = Object.keys(groupField.options).map(key =>
              `${key}:${groupField.options[key].label || groupField.options[key]}`
            );
            groupOptionDetails = groupChoices.join('; ');
          } else {
            groupOptionDetails = Object.keys(groupField.options).map(key =>
              `${key}=${JSON.stringify(groupField.options[key])}`
            ).join('; ');
          }
        }

        csvLines.push([
          '"グループ"',
          `"${fieldCode}"`,
          `"${groupFieldCode}"`,
          `"${groupField.label || ''}"`,
          `"${groupField.type}"`,
          `"${groupField.required ? 'はい' : 'いいえ'}"`,
          `"${groupField.description || ''}"`,
          `"${groupOptionDetails}"`
        ].join(','));
      });
    }

    return csvLines;
  };

  /**
   * CSV出力用：グループフィールドのヘッダー情報取得
   * @param {Object} field - グループフィールドのスキーマ
   * @param {string} fieldCode - フィールドコード
   * @returns {Array} ヘッダー情報の配列
   */
  const getGroupHeadersForCSV = (field, fieldCode) => {
    const headers = [];
    const fieldCodes = [];

    if (field.type === 'GROUP' && field.fields) {
      Object.keys(field.fields).forEach(groupFieldCode => {
        const groupField = field.fields[groupFieldCode];
        if (!['SPACER', 'HR', 'LABEL'].includes(groupField.type)) {
          headers.push(`${field.label}/${groupField.label}(${groupFieldCode})`);
          fieldCodes.push({ type: 'group', parentCode: fieldCode, fieldCode: groupFieldCode });
        }
      });
    }

    return { headers, fieldCodes };
  };

  /**
   * CSV出力用：グループフィールドの値を取得
   * @param {Object} record - レコードデータ
   * @param {Object} fieldInfo - フィールド情報
   * @returns {*} グループフィールドの値
   */
  const getGroupValueForCSV = (record, fieldInfo) => {
    // グループ内フィールドの場合
    const groupData = record[fieldInfo.parentCode];
    if (groupData && typeof groupData === 'object') {
      return groupData[fieldInfo.fieldCode];
    } else {
      // グループデータが存在しない場合、直接フィールドから取得を試す
      return record[fieldInfo.fieldCode];
    }
  };

  /**
   * グループフィールドが存在するかチェック
   * @param {Object} schema - スキーマオブジェクト
   * @returns {boolean} グループフィールドが存在するか
   */
  const hasGroupFields = (schema) => {
    return Object.values(schema).some(field => field.type === 'GROUP');
  };

  /**
   * グループフィールド数をカウント
   * @param {Object} schema - スキーマオブジェクト
   * @returns {number} グループフィールド数
   */
  const countGroupFields = (schema) => {
    return Object.values(schema).filter(field => field.type === 'GROUP').length;
  };

  // グローバル関数として公開
  window.GroupFieldProcessor = {
    processGroupSchema,
    processGroupRecordData,
    formatGroupFieldValue,
    processGroupSchemaForCSV,
    getGroupHeadersForCSV,
    getGroupValueForCSV,
    hasGroupFields,
    countGroupFields
  };

  console.log('グループフィールドプロセッサー スクリプトが読み込まれました');

})();
