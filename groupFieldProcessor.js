(() => {
  'use strict';

  /**
   * グループフィールド処理専用モジュール
   * グループフィールドに関する処理を集約し、コードの見通しを改善
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
   * グループフィールドのスキーマを処理
   * @param {Object} field - グループフィールドのスキーマ
   * @param {string} fieldCode - フィールドコード
   * @param {Function} getFieldTypeLabel - フィールドタイプラベル取得関数
   * @returns {Array} グループ内フィールドの配列
   */
  const processGroupSchema = (field, fieldCode, getFieldTypeLabel) => {
    const subFields = [];

    console.log(`processGroupSchema: グループフィールド ${fieldCode} を処理:`, field);
    console.log(`processGroupSchema: field.fields:`, field.fields);

    if (field.type === 'GROUP' && field.fields) {
      console.log(`processGroupSchema: グループ内フィールドの処理開始:`, Object.keys(field.fields));
      Object.keys(field.fields).forEach(groupFieldCode => {
        const groupField = field.fields[groupFieldCode];
        console.log(`processGroupSchema: グループ内フィールド ${groupFieldCode}:`, groupField);
        subFields.push({
          code: groupFieldCode,
          label: groupField.label || groupFieldCode,
          type: getFieldTypeLabel(groupField.type),
          rawType: groupField.type, // 元のフィールドタイプを保持
          required: groupField.required ? 'はい' : 'いいえ',
          description: groupField.description || '',
          options: groupField.options || null, // オプション情報を保持
          expression: groupField.expression || null, // 計算式を保持
          referenceTable: groupField.referenceTable || null, // 関連レコード一覧情報を保持
          lookup: groupField.lookup || null // ルックアップ情報を保持
        });
      });
    }

    console.log(`processGroupSchema: 処理結果:`, subFields);
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
    } else if (fieldSchema.lookup) {
      // ルックアップフィールドの場合（lookupプロパティが設定されている場合）、ルックアップされた値を処理
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

    // デバッグ情報を追加
    console.log(`グループフィールド ${fieldCode} の処理:`, field);
    console.log(`field.fields:`, field.fields);
    console.log(`field.fields の型:`, typeof field.fields);
    console.log(`field.fields が配列か:`, Array.isArray(field.fields));

    // グループフィールド自体
    const groupFieldCount = Object.keys(field.fields || {}).length;
    console.log(`グループ内フィールド数: ${groupFieldCount}`);

    csvLines.push([
      `"${fieldCode}"`,
      `"${field.label || ''}"`,
      `"${field.type}"`,
      `"${field.required ? 'はい' : 'いいえ'}"`,
      `"グループ内フィールド数: ${groupFieldCount}"`
    ].join(','));

    // グループ内のフィールドを処理
    if (field.fields) {
      console.log(`グループ内フィールドの処理開始:`, Object.keys(field.fields));
      Object.keys(field.fields).forEach(groupFieldCode => {
        const groupField = field.fields[groupFieldCode];
        console.log(`グループ内フィールド ${groupFieldCode}:`, groupField);

        // グループ内フィールドのオプション詳細
        let groupOptionDetails = '';

        // ラベルフィールドの場合
        if (groupField.type === 'LABEL') {
          groupOptionDetails = `表示テキスト: ${groupField.label || ''}`;
        }
        // 計算フィールドの場合
        else if (groupField.type === 'CALC') {
          if (groupField.expression) {
            groupOptionDetails = `計算式: ${groupField.expression}`;
          } else {
            groupOptionDetails = '計算フィールド';
          }
        }
        // 関連レコード一覧フィールドの場合
        else if (groupField.type === 'REFERENCE_TABLE') {
          const details = [];
          if (groupField.referenceTable && groupField.referenceTable.relatedApp) {
            const appDisplayName = getAppDisplayName(groupField.referenceTable.relatedApp.app);
            details.push(`関連アプリ: ${appDisplayName}`);
          }
          if (groupField.referenceTable && groupField.referenceTable.condition) {
            const formattedCondition = window.UIHelpers.formatReferenceTableCondition(groupField.referenceTable.condition);
            details.push(`条件: ${formattedCondition}`);
          }
          if (groupField.referenceTable && groupField.referenceTable.filterCond) {
            const formattedFilter = window.UIHelpers.formatReferenceTableFilter(groupField.referenceTable.filterCond);
            details.push(`絞り込み: ${formattedFilter}`);
          }
          if (groupField.referenceTable && groupField.referenceTable.displayFields) {
            const displayFieldCodes = groupField.referenceTable.displayFields.join(', ');
            details.push(`表示フィールド: ${displayFieldCodes}`);
          }
          if (groupField.referenceTable && groupField.referenceTable.sort) {
            const formattedSort = window.UIHelpers.formatReferenceTableSort(groupField.referenceTable.sort);
            details.push(`ソート: ${formattedSort}`);
          }
          groupOptionDetails = details.length > 0 ? details.join('; ') : '関連レコード一覧';
        }
        // ルックアップフィールドの場合（lookupプロパティが設定されている場合）
        else if (groupField.lookup) {
          const details = [];
          if (groupField.lookup.relatedApp) {
            const appDisplayName = getAppDisplayName(groupField.lookup.relatedApp.app);
            details.push(`参照アプリ: ${appDisplayName}`);
          }
          if (groupField.lookup.relatedKeyField) {
            details.push(`参照キー: ${groupField.lookup.relatedKeyField}`);
          }
          if (groupField.lookup.fieldMappings) {
            const mappings = groupField.lookup.fieldMappings.map(mapping =>
              `${mapping.field}→${mapping.relatedField}`
            );
            details.push(`フィールドマッピング: ${mappings.join(', ')}`);
          }
          if (groupField.lookup.lookupPickerFields) {
            details.push(`検索対象: ${groupField.lookup.lookupPickerFields.join(', ')}`);
          }
          if (groupField.lookup.filterCond) {
            const formattedFilter = window.UIHelpers.formatReferenceTableFilter(groupField.lookup.filterCond);
            details.push(`絞り込み: ${formattedFilter}`);
          }
          if (groupField.lookup.sort) {
            const formattedSort = window.UIHelpers.formatReferenceTableSort(groupField.lookup.sort);
            details.push(`ソート: ${formattedSort}`);
          }
          groupOptionDetails = details.length > 0 ? details.join('; ') : 'ルックアップ';
        }
        // 選択肢型フィールドの場合
        else if (groupField.options) {
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
          `"${groupFieldCode}"`,
          `"${groupField.label || ''}"`,
          `"${groupField.type}"`,
          `"${groupField.required ? 'はい' : 'いいえ'}"`,
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
        if (!['SPACER', 'HR'].includes(groupField.type)) {
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
