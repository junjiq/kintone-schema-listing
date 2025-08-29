(() => {
  'use strict';

  /**
   * データフォーマット関連の関数
   * スキーマやレコードデータの整形、表示用の変換を担当
   */

  /**
   * フィールドタイプを日本語に変換
   */
  const getFieldTypeLabel = (fieldType) => {
    const typeMap = {
      'SINGLE_LINE_TEXT': '文字列（1行）',
      'MULTI_LINE_TEXT': '文字列（複数行）',
      'RICH_TEXT': 'リッチエディター',
      'NUMBER': '数値',
      'CALC': '計算',
      'RADIO_BUTTON': 'ラジオボタン',
      'CHECK_BOX': 'チェックボックス',
      'MULTI_SELECT': '複数選択',
      'DROP_DOWN': 'ドロップダウン',
      'DATE': '日付',
      'TIME': '時刻',
      'DATETIME': '日時',
      'LINK': 'リンク',
      'FILE': 'ファイル',
      'USER_SELECT': 'ユーザー選択',
      'ORGANIZATION_SELECT': '組織選択',
      'GROUP_SELECT': 'グループ選択',
      'LOOKUP': 'ルックアップ',
      'REFERENCE_TABLE': '関連レコード一覧',
      'SUBTABLE': 'テーブル',
      'GROUP': 'グループ',
      'LABEL': 'ラベル',
      'CREATOR': '作成者',
      'CREATED_TIME': '作成日時',
      'MODIFIER': '更新者',
      'UPDATED_TIME': '更新日時',
      'CATEGORY': 'カテゴリー',
      'STATUS': 'ステータス',
      'STATUS_ASSIGNEE': '作業者',
      'RECORD_NUMBER': 'レコード番号'
    };
    return typeMap[fieldType] || fieldType;
  };

  /**
   * スキーマを表示用に整理
   */
  const formatSchema = (schema) => {
    const formattedSchema = [];

    console.log('formatSchema: スキーマ全体:', schema);
    console.log('formatSchema: フィールドタイプ一覧:', Object.keys(schema).map(code => `${code}: ${schema[code].type}`));

    // グループフィールドの存在確認
    const groupFields = Object.keys(schema).filter(code => schema[code].type === 'GROUP');
    console.log('formatSchema: グループフィールド一覧:', groupFields);
    if (groupFields.length > 0) {
      groupFields.forEach(code => {
        console.log(`formatSchema: グループフィールド ${code}:`, schema[code]);
      });
    } else {
      console.log('formatSchema: グループフィールドは存在しません');
    }

    // グループフィールド内に含まれるフィールドコードを収集（重複表示を防ぐため）
    const fieldsInGroups = new Set();
    Object.keys(schema).forEach(fieldCode => {
      const field = schema[fieldCode];
      if (field.type === 'GROUP' && field.fields) {
        Object.keys(field.fields).forEach(groupFieldCode => {
          fieldsInGroups.add(groupFieldCode);
        });
      }
    });
    console.log('formatSchema: グループ内フィールド一覧:', Array.from(fieldsInGroups));

    Object.keys(schema).forEach(fieldCode => {
      const field = schema[fieldCode];

      // グループ内に含まれるフィールドはメインレベルでは処理しない（重複表示を防ぐため）
      if (fieldsInGroups.has(fieldCode)) {
        console.log(`formatSchema: フィールド ${fieldCode} はグループ内フィールドのためスキップ`);
        return;
      }

      const fieldInfo = {
        code: field.type === 'LABEL' ? 'FC未定義' : fieldCode,
        label: field.type === 'LABEL' ? 'FN未定義' : (field.label || fieldCode),
        type: getFieldTypeLabel(field.type),
        rawType: field.type, // 元のフィールドタイプを保持
        required: field.required ? 'はい' : 'いいえ',
        description: field.description || '',
        options: field.options || null, // オプション情報を保持
        expression: field.expression || null, // 計算式を保持
        referenceTable: field.referenceTable || null, // 関連レコード一覧情報を保持
        lookup: field.lookup || null, // ルックアップ情報を保持
        defaultValue: field.defaultValue || null, // 初期値情報を保持
        subFields: [],
        originalLabel: field.label || '' // 元のラベル情報を保持（LABELフィールド用）
      };

      // サブテーブルの場合はサブフィールドも処理
      if (field.type === 'SUBTABLE' && field.fields) {
        fieldInfo.subFields = SubtableFieldProcessor.processSubtableSchema(field, fieldCode, getFieldTypeLabel);
      }

      // グループの場合はグループ内のフィールドも処理
      if (field.type === 'GROUP' && field.fields) {
        console.log(`データフォーマット: グループフィールド ${fieldCode} を処理:`, field);
        fieldInfo.subFields = GroupFieldProcessor.processGroupSchema(field, fieldCode, getFieldTypeLabel);
        console.log(`グループフィールド ${fieldCode} のサブフィールド:`, fieldInfo.subFields);
      }

      formattedSchema.push(fieldInfo);
    });

    return formattedSchema;
  };

  /**
   * レコードデータを整理
   */
  const formatRecordData = (records, schema) => {
    return records.map(record => {
      const formattedRecord = {
        recordId: record.$id.value
      };

      // グループフィールド内に含まれるフィールドコードを収集（重複表示を防ぐため）
      const fieldsInGroups = new Set();
      Object.keys(schema).forEach(fieldCode => {
        const field = schema[fieldCode];
        if (field.type === 'GROUP' && field.fields) {
          Object.keys(field.fields).forEach(groupFieldCode => {
            fieldsInGroups.add(groupFieldCode);
          });
        }
      });

      Object.keys(schema).forEach(fieldCode => {
        // グループ内に含まれるフィールドはメインレベルでは処理しない（重複表示を防ぐため）
        if (fieldsInGroups.has(fieldCode)) {
          return;
        }
        const field = schema[fieldCode];
        const value = record[fieldCode];

        if (value) {
          if (field.type === 'SUBTABLE') {
            formattedRecord[fieldCode] = SubtableFieldProcessor.processSubtableRecordData(value, fieldCode);
          } else if (field.type === 'GROUP') {
            // グループフィールドの場合、グループ内の各フィールドの値を処理
            formattedRecord[fieldCode] = GroupFieldProcessor.processGroupRecordData(record, field, fieldCode);
          } else if (field.type === 'USER_SELECT' || field.type === 'ORGANIZATION_SELECT' || field.type === 'GROUP_SELECT') {
            formattedRecord[fieldCode] = value.value.map(item => item.name || item.code);
          } else if (field.type === 'FILE') {
            formattedRecord[fieldCode] = value.value.map(file => file.name);
          } else if (field.type === 'CHECK_BOX' || field.type === 'MULTI_SELECT') {
            formattedRecord[fieldCode] = value.value;
          } else if (field.lookup) {
            // ルックアップフィールドの場合（lookupプロパティが設定されている場合）、ルックアップされた値を処理
            formattedRecord[fieldCode] = value.value;
          } else {
            // 通常のフィールド値の処理
            let fieldValue = value.value;

            // null値の処理
            if (fieldValue === null || fieldValue === undefined) {
              // ドロップダウンやラジオボタンなどの選択系フィールドの場合
              if (field.type === 'DROP_DOWN' ||
                  field.type === 'RADIO_BUTTON' ||
                  field.type === 'CHECK_BOX' ||
                  field.type === 'MULTI_SELECT') {
                fieldValue = '(未選択)';
              } else {
                fieldValue = '';
              }
            }

            formattedRecord[fieldCode] = fieldValue;
          }
        } else {
          // ラベルフィールドは値を持たないため、スキーマのラベル情報を使用
          if (field.type === 'LABEL') {
            formattedRecord[fieldCode] = field.label || '';
          } else if (field.type === 'GROUP') {
            // グループフィールドの値がない場合でも、グループ内フィールドの値を処理
            formattedRecord[fieldCode] = GroupFieldProcessor.processGroupRecordData(record, field, fieldCode);
          } else {
            // 値が存在しない場合の処理
            if (field.type === 'DROP_DOWN' ||
                field.type === 'RADIO_BUTTON' ||
                field.type === 'CHECK_BOX' ||
                field.type === 'MULTI_SELECT') {
              formattedRecord[fieldCode] = '(未選択)';
            } else {
              formattedRecord[fieldCode] = null;
            }
          }
        }
      });

      return formattedRecord;
    });
  };

  // グローバル関数として公開
  window.DataFormatters = {
    getFieldTypeLabel,
    formatSchema,
    formatRecordData
  };

  console.log('データフォーマット スクリプトが読み込まれました');

})();
