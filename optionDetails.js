(() => {
  'use strict';

  /**
   * オプション詳細生成関連の機能
   */

  // App表示名の取得（AppCache API があれば利用）
  const getAppDisplayName = (appId) => {
    if (window.AppCache && typeof window.AppCache.getAppDisplayName === 'function') {
      return window.AppCache.getAppDisplayName(appId);
    }
    return `アプリID: ${String(appId)}`;
  };

  /**
   * 関連レコード一覧の条件をフォーマット
   */
  const formatReferenceTableCondition = (condition) => {
    if (!condition) return '';

    if (typeof condition === 'string') {
      return condition;
    }

    if (typeof condition === 'object') {
      const conditions = [];

      // フィールド条件
      if (condition.field) {
        conditions.push(`フィールド: ${condition.field}`);
      }

      // 関連フィールド条件
      if (condition.relatedField) {
        conditions.push(`関連フィールド: ${condition.relatedField}`);
      }

      // 演算子
      if (condition.operator) {
        conditions.push(`演算子: ${condition.operator}`);
      }

      // 値
      if (condition.value !== undefined) {
        if (Array.isArray(condition.value)) {
          conditions.push(`値: [${condition.value.join(', ')}]`);
        } else {
          conditions.push(`値: ${condition.value}`);
        }
      }

      // 複数条件の場合
      if (condition.conditions && Array.isArray(condition.conditions)) {
        const subConditions = condition.conditions.map(subCond =>
          formatReferenceTableCondition(subCond)
        );
        conditions.push(`条件: ${subConditions.join(' AND ')}`);
      }

      return conditions.join(' ');
    }

    return JSON.stringify(condition);
  };

  /**
   * 関連レコード一覧のソート条件をフォーマット
   */
  const formatReferenceTableSort = (sort) => {
    if (!sort) return '';

    if (typeof sort === 'string') {
      return sort;
    }

    if (typeof sort === 'object') {
      const sortInfo = [];

      if (sort.field) {
        sortInfo.push(`フィールド: ${sort.field}`);
      }

      if (sort.order) {
        sortInfo.push(`順序: ${sort.order}`);
      }

      return sortInfo.join(', ');
    }

    return JSON.stringify(sort);
  };

  /**
   * 関連レコード一覧の絞り込み条件をフォーマット
   */
  const formatReferenceTableFilter = (filterCond) => {
    if (!filterCond) return '';

    if (typeof filterCond === 'string') {
      return filterCond;
    }

    if (typeof filterCond === 'object') {
      const filters = [];

      // 複数条件の場合
      if (filterCond.conditions && Array.isArray(filterCond.conditions)) {
        const subFilters = filterCond.conditions.map(subFilter =>
          formatReferenceTableFilter(subFilter)
        );
        filters.push(`絞り込み: ${subFilters.join(' AND ')}`);
      } else {
        // 単一条件の場合
        if (filterCond.field) {
          filters.push(`フィールド: ${filterCond.field}`);
        }
        if (filterCond.relatedField) {
          filters.push(`関連フィールド: ${filterCond.relatedField}`);
        }
        if (filterCond.operator) {
          filters.push(`演算子: ${filterCond.operator}`);
        }
        if (filterCond.value !== undefined) {
          if (Array.isArray(filterCond.value)) {
            filters.push(`値: [${filterCond.value.join(', ')}]`);
          } else {
            filters.push(`値: ${filterCond.value}`);
          }
        }
      }

      return filters.join(' ');
    }

    return JSON.stringify(filterCond);
  };

  /**
   * フィールドのオプション詳細を生成（テキスト版 - CSV出力用）
   */
  const generateOptionDetailsText = (field) => {
    let optionDetails = '';
    const fieldType = field.rawType || field.type;

    // 初期値情報を追加
    if (field.defaultValue !== null && field.defaultValue !== undefined) {
      const defaultValue = field.defaultValue;
      // 改行コードだけの場合は表示しない
      if (typeof defaultValue === 'string' && defaultValue.trim() === '') {
        // 改行コードだけの場合は何もしない
      } else if (fieldType === 'RICH_TEXT' && typeof defaultValue === 'string' && defaultValue.includes('<')) {
        // リッチエディターでHTMLが含まれている場合、HTMLタグは除去せずにそのまま表示
        optionDetails += `初期値: ${defaultValue}; `;
      } else {
        optionDetails += `初期値: ${JSON.stringify(defaultValue)}; `;
      }
    } else if (field.options && field.options.defaultValue !== null && field.options.defaultValue !== undefined) {
      // リッチエディターなど、optionsの中にdefaultValueがある場合
      const defaultValue = field.options.defaultValue;
      // 改行コードだけの場合は表示しない
      if (typeof defaultValue === 'string' && defaultValue.trim() === '') {
        // 改行コードだけの場合は何もしない
      } else if (fieldType === 'RICH_TEXT' && typeof defaultValue === 'string' && defaultValue.includes('<')) {
        // リッチエディターでHTMLが含まれている場合、HTMLタグは除去せずにそのまま表示
        optionDetails += `初期値: ${defaultValue}; `;
      } else if (fieldType === 'RICH_TEXT' && typeof defaultValue === 'string') {
        // リッチエディターでHTMLタグなしの文字列の場合
        optionDetails += `初期値: ${defaultValue}; `;
      } else if (fieldType === 'RICH_TEXT') {
        // リッチエディターの場合、JSON.stringifyを使用
        optionDetails += `初期値: ${JSON.stringify(defaultValue)}; `;
      } else {
        optionDetails += `初期値: ${JSON.stringify(defaultValue)}; `;
      }
    }

    // ラベルフィールドの場合
    if (fieldType === 'LABEL') {
      optionDetails += `表示テキスト: ${field.originalLabel || field.label || ''}`;
    }
    // 計算フィールドの場合
    else if (fieldType === 'CALC') {
      if (field.expression) {
        optionDetails += `計算式: ${field.expression}`;
      } else if (field.options && field.options.expression) {
        optionDetails += `計算式: ${field.options.expression}`;
      } else {
        optionDetails += '計算フィールド';
      }
    }
    // 関連レコード一覧フィールドの場合
    else if (fieldType === 'REFERENCE_TABLE') {
      const details = [];
      if (field.referenceTable && field.referenceTable.relatedApp) {
        const appDisplayName = getAppDisplayName(field.referenceTable.relatedApp.app);
        details.push(`関連アプリ: ${appDisplayName}`);
      }
      if (field.referenceTable && field.referenceTable.condition) {
        details.push(`条件: ${formatReferenceTableCondition(field.referenceTable.condition)}`);
      }
      if (field.referenceTable && field.referenceTable.filterCond) {
        details.push(`絞り込み: ${formatReferenceTableFilter(field.referenceTable.filterCond)}`);
      }
      if (field.referenceTable && field.referenceTable.displayFields) {
        const displayFieldCodes = field.referenceTable.displayFields.join(', ');
        details.push(`表示フィールド: ${displayFieldCodes}`);
      }
      if (field.referenceTable && field.referenceTable.sort) {
        const sortInfo = field.referenceTable.sort;
        details.push(`ソート: ${formatReferenceTableSort(sortInfo)}`);
      }
      optionDetails += details.length > 0 ? details.join('; ') : '関連レコード一覧';
    }
    // ルックアップフィールドの場合（lookupプロパティが設定されている場合）
    else if (field.lookup) {
      const details = [];
      if (field.lookup.relatedApp) {
        const appDisplayName = getAppDisplayName(field.lookup.relatedApp.app);
        details.push(`参照アプリ: ${appDisplayName}`);
      }
      if (field.lookup.relatedKeyField) {
        details.push(`参照キー: ${field.lookup.relatedKeyField}`);
      }
      if (field.lookup.fieldMappings) {
        const mappings = field.lookup.fieldMappings.map(mapping =>
          `${mapping.field}→${mapping.relatedField}`
        );
        details.push(`フィールドマッピング: ${mappings.join(', ')}`);
      }
      if (field.lookup.lookupPickerFields) {
        details.push(`検索対象: ${field.lookup.lookupPickerFields.join(', ')}`);
      }
      if (field.lookup.filterCond) {
        details.push(`絞り込み: ${formatReferenceTableFilter(field.lookup.filterCond)}`);
      }
      if (field.lookup.sort) {
        const sortInfo = field.lookup.sort;
        details.push(`ソート: ${formatReferenceTableSort(sortInfo)}`);
      }
      optionDetails += details.length > 0 ? details.join('; ') : 'ルックアップ';
    }
    // グループフィールドの場合
    else if (fieldType === 'GROUP') {
      const groupFieldCount = field.subFields ? field.subFields.length : 0;
      optionDetails += `グループ内フィールド数: ${groupFieldCount}`;
    }
    // サブテーブルフィールドの場合
    else if (fieldType === 'SUBTABLE') {
      const subFieldCount = field.subFields ? field.subFields.length : 0;
      optionDetails += `サブフィールド数: ${subFieldCount}`;
    }
    // 通常のオプション詳細処理
    else if (field.options) {
      if (fieldType === 'DROP_DOWN' || fieldType === 'RADIO_BUTTON' ||
          fieldType === 'CHECK_BOX' || fieldType === 'MULTI_SELECT') {
        // 選択肢型フィールドの場合
        const choices = Object.keys(field.options).map(key =>
          `${key}:${field.options[key].label || field.options[key]}`);
        optionDetails += choices.join('; ');
      } else if (fieldType === 'RICH_TEXT') {
        // リッチエディターの場合、HTMLタグを除去してテキストのみ表示
        const options = Object.keys(field.options).map(key => {
          const value = field.options[key];
          if (key === 'defaultValue' && typeof value === 'string' && value.includes('<')) {
            // HTMLタグを除去してテキストのみを表示
            const textOnly = value.replace(/<[^>]*>/g, '');
            return `${key}: ${textOnly}`;
          } else if (key === 'defaultValue' && typeof value === 'string') {
            // 初期値が文字列の場合（HTMLタグなし）
            return `${key}: ${value}`;
          } else if (key === 'defaultValue') {
            // 初期値がその他の型の場合
            return `${key}: ${JSON.stringify(value)}`;
          } else {
            return `${key}=${JSON.stringify(value)}`;
          }
        });
        optionDetails += options.join('; ');
      } else {
        // その他のオプション
        optionDetails += Object.keys(field.options).map(key =>
          `${key}=${JSON.stringify(field.options[key])}`).join('; ');
      }
    }

    return optionDetails;
  };

  /**
   * フィールドのオプション詳細を生成（HTML版 - UI表示用）
   */
  const generateOptionDetails = (field) => {
    const fieldType = field.rawType || field.type;
    let details = [];

    // 初期値情報を追加
    if (field.defaultValue !== null && field.defaultValue !== undefined) {
      const defaultValue = field.defaultValue;
      // 改行コードだけの場合は表示しない
      if (typeof defaultValue === 'string' && defaultValue.trim() === '') {
        // 改行コードだけの場合は何もしない
      } else if (typeof defaultValue === 'string' && defaultValue.includes('<')) {
        // HTMLが含まれている場合はレンダリング
        details.push(`<strong>初期値:</strong><div style="border: 1px solid #ddd; padding: 5px; margin: 2px 0; background: #f9f9f9;">${defaultValue}</div>`);
      } else {
        details.push(`<strong>初期値:</strong> ${JSON.stringify(defaultValue)}`);
      }
    } else if (field.options && field.options.defaultValue !== null && field.options.defaultValue !== undefined) {
      // リッチエディターなど、optionsの中にdefaultValueがある場合
      const defaultValue = field.options.defaultValue;
      // 改行コードだけの場合は表示しない
      if (typeof defaultValue === 'string' && defaultValue.trim() === '') {
        // 改行コードだけの場合は何もしない
      } else if (typeof defaultValue === 'string' && defaultValue.includes('<')) {
        // HTMLが含まれている場合はレンダリング
        details.push(`<strong>初期値:</strong><div style="border: 1px solid #ddd; padding: 5px; margin: 2px 0; background: #f9f9f9;">${defaultValue}</div>`);
      } else {
        details.push(`<strong>初期値:</strong> ${JSON.stringify(defaultValue)}`);
      }
    }

    // ラベルフィールドの場合
    if (fieldType === 'LABEL') {
      details.push(`<strong>表示テキスト:</strong> ${field.originalLabel || field.label || ''}`);
    }
    // 計算フィールドの場合
    else if (fieldType === 'CALC') {
      if (field.expression) {
        details.push(`<strong>計算式:</strong> ${field.expression}`);
      } else if (field.options && field.options.expression) {
        details.push(`<strong>計算式:</strong> ${field.options.expression}`);
      } else {
        details.push('計算フィールド');
      }
    }
    // 関連レコード一覧フィールドの場合
    else if (fieldType === 'REFERENCE_TABLE') {
      if (field.referenceTable && field.referenceTable.relatedApp) {
        const appDisplayName = getAppDisplayName(field.referenceTable.relatedApp.app);
        details.push(`<strong>関連アプリ:</strong> ${appDisplayName}`);
      }
      if (field.referenceTable && field.referenceTable.condition) {
        details.push(`<strong>条件:</strong> ${formatReferenceTableCondition(field.referenceTable.condition)}`);
      }
      if (field.referenceTable && field.referenceTable.filterCond) {
        details.push(`<strong>絞り込み:</strong> ${formatReferenceTableFilter(field.referenceTable.filterCond)}`);
      }
      if (field.referenceTable && field.referenceTable.displayFields) {
        const displayFieldCodes = field.referenceTable.displayFields.join(', ');
        details.push(`<strong>表示フィールド:</strong> ${displayFieldCodes}`);
      }
      if (field.referenceTable && field.referenceTable.sort) {
        const sortInfo = field.referenceTable.sort;
        details.push(`<strong>ソート:</strong> ${formatReferenceTableSort(sortInfo)}`);
      }
      if (details.length === 0) {
        details.push('関連レコード一覧');
      }
    }
    // ルックアップフィールドの場合（lookupプロパティが設定されている場合）
    else if (field.lookup) {
      if (field.lookup.relatedApp) {
        const appDisplayName = getAppDisplayName(field.lookup.relatedApp.app);
        details.push(`<strong>参照アプリ:</strong> ${appDisplayName}`);
      }
      if (field.lookup.relatedKeyField) {
        details.push(`<strong>参照キー:</strong> ${field.lookup.relatedKeyField}`);
      }
      if (field.lookup.fieldMappings) {
        const mappings = field.lookup.fieldMappings.map(mapping =>
          `${mapping.field}→${mapping.relatedField}`
        );
        details.push(`<strong>フィールドマッピング:</strong> ${mappings.join(', ')}`);
      }
      if (field.lookup.lookupPickerFields) {
        details.push(`<strong>検索対象:</strong> ${field.lookup.lookupPickerFields.join(', ')}`);
      }
      if (field.lookup.filterCond) {
        details.push(`<strong>絞り込み:</strong> ${formatReferenceTableFilter(field.lookup.filterCond)}`);
      }
      if (field.lookup.sort) {
        const sortInfo = field.lookup.sort;
        details.push(`<strong>ソート:</strong> ${formatReferenceTableSort(sortInfo)}`);
      }
      if (details.length === 0) {
        details.push('ルックアップ');
      }
    }
    // グループフィールドの場合
    else if (fieldType === 'GROUP') {
      const groupFieldCount = field.subFields ? field.subFields.length : 0;
      details.push(`<strong>グループ内フィールド数:</strong> ${groupFieldCount}`);
    }
    // サブテーブルフィールドの場合
    else if (fieldType === 'SUBTABLE') {
      const subFieldCount = field.subFields ? field.subFields.length : 0;
      details.push(`<strong>サブフィールド数:</strong> ${subFieldCount}`);
    }
    // 通常のオプション詳細処理
    else if (field.options) {
      if (fieldType === 'DROP_DOWN' || fieldType === 'RADIO_BUTTON' ||
          fieldType === 'CHECK_BOX' || fieldType === 'MULTI_SELECT') {
        // 選択肢型フィールドの場合
        const choices = Object.keys(field.options).map(key =>
          `<strong>${key}:</strong>${field.options[key].label || field.options[key]}`);
        details.push(choices.join('<br>'));
      } else if (fieldType === 'RICH_TEXT') {
        // リッチエディターの場合、HTMLをレンダリング
        const options = Object.keys(field.options).map(key => {
          const value = field.options[key];
          if (key === 'defaultValue' && typeof value === 'string' && value.includes('<')) {
            // HTMLが含まれている場合はレンダリング
            return `<strong>${key}:</strong><div style="border: 1px solid #ddd; padding: 5px; margin: 2px 0; background: #f9f9f9;">${value}</div>`;
          } else {
            return `<strong>${key}=</strong>${JSON.stringify(value)}`;
          }
        });
        details.push(options.join('<br>'));
      } else {
        // その他のオプション（すべてのフィールドタイプでプロパティ名をボールド表示）
        const options = Object.keys(field.options).map(key => {
          const value = field.options[key];
          if (typeof value === 'string' && value.includes('<')) {
            // HTMLが含まれている場合はレンダリング
            return `<strong>${key}:</strong><div style="border: 1px solid #ddd; padding: 5px; margin: 2px 0; background: #f9f9f9;">${value}</div>`;
          } else {
            return `<strong>${key}=</strong>${JSON.stringify(value)}`;
          }
        });
        details.push(options.join('<br>'));
      }
    }

    return details.join('<br>');
  };

  // グローバル関数として公開
  window.OptionDetails = {
    generateOptionDetailsText,
    generateOptionDetails,
    formatReferenceTableCondition,
    formatReferenceTableSort,
    formatReferenceTableFilter
  };

  console.log('オプション詳細 スクリプトが読み込まれました');

})();
