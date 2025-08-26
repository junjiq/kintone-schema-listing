(() => {
  'use strict';

  /**
   * Kintone API関連の関数
   * アプリ情報取得、スキーマ取得、レコード取得などのAPI呼び出しを担当
   */

  /**
   * 現在のアプリ情報を取得
   */
  const getCurrentAppInfo = () => {
    try {
      const appId = kintone.app.getId();

      // kintone.app.getName()は存在しないため、アプリIDのみを返す
      // アプリ名が必要な場合は、後でgetAppNameById()を使用する
      return { appId, appName: null };
    } catch (error) {
      console.warn('現在のアプリ情報の取得に失敗:', error);
      return null;
    }
  };

  /**
   * スペース内の全アプリケーション情報を取得
   */
  const getAllAppsInSpace = async () => {
    try {
      const response = await kintone.api(kintone.api.url('/k/v1/apps.json', true), 'GET', {});
      return response.apps;
    } catch (error) {
      console.error('アプリ一覧取得エラー:', error);
      throw error;
    }
  };

  /**
   * アプリ名からアプリIDを取得
   */
  const getAppIdByName = async (appName) => {
    const apps = await getAllAppsInSpace();
    const targetApp = apps.find(app => app.name === appName);

    if (!targetApp) {
      throw new Error(`アプリ "${appName}" が見つかりません`);
    }

    return targetApp.appId;
  };

  /**
   * アプリIDからアプリ名を取得
   */
  const getAppNameById = async (appId) => {
    try {
      const apps = await getAllAppsInSpace();
      const targetApp = apps.find(app => app.appId === appId);
      return targetApp ? targetApp.name : null;
    } catch (error) {
      console.error('アプリ名取得エラー:', error);
      return null;
    }
  };

  /**
   * アプリのフォーム情報（スキーマ）を取得
   */
  const getAppSchema = async (appId) => {
    try {
      const response = await kintone.api(kintone.api.url('/k/v1/app/form/fields.json', true), 'GET', {
        app: appId
      });

      const schema = response.properties;
      console.log('取得されたスキーマ:', schema);

      // グループフィールドの詳細情報を確認
      Object.keys(schema).forEach(fieldCode => {
        const field = schema[fieldCode];
        if (field.type === 'GROUP') {
          console.log(`グループフィールド ${fieldCode} のfieldsプロパティ:`, field.fields);
        }
      });

      // フォームレイアウト情報も取得してグループフィールドの詳細を確認
      let layoutResponse = null;
      try {
        console.log('フォームレイアウト情報を取得中...');
        layoutResponse = await kintone.api(kintone.api.url('/k/v1/app/form/layout.json', true), 'GET', {
          app: appId
        });
        console.log('フォームレイアウト情報取得成功:', layoutResponse);
      } catch (layoutError) {
        console.warn('フォームレイアウト情報の取得に失敗:', layoutError);
      }

      // レイアウト情報からグループフィールドの詳細を取得
      if (layoutResponse && layoutResponse.layout) {
        console.log('レイアウト情報の構造:', layoutResponse.layout);
        const groupFields = {};

        // グループフィールド情報を収集する関数
        function walkLayout(nodes, currentGroup) {
          for (const node of nodes) {
            if (node.type === 'GROUP') {
              console.log(`グループフィールド ${node.code} を処理中...`);
              const groupInfo = {
                groupCode: node.code || null,
                groupLabel: node.label || null,
                fields: {}
              };
              groupFields[node.code] = groupInfo;

              // GROUP の中は node.layout（配列）
              walkLayout(node.layout || [], groupInfo);
            } else if (node.type === 'ROW') {
              // ROW の中は fields（配列）
              for (const f of (node.fields || [])) {
                if (f.type === 'SUBTABLE') {
                  // サブテーブル配下の fields も拾いたければここで処理
                  for (const sf of (f.fields || [])) {
                    if (currentGroup) {
                      // codeプロパティが存在しない場合は、labelをベースにしたキーを生成
                      const fieldKey = sf.code || `label_${sf.label ? sf.label.replace(/[^a-zA-Z0-9]/g, '_') : 'unknown'}`;
                      currentGroup.fields[fieldKey] = {
                        code: sf.code || fieldKey,
                        label: sf.label,
                        type: sf.type,
                        inSubtable: f.code
                      };
                    }
                  }
                } else {
                  if (currentGroup) {
                    // codeプロパティが存在しない場合は、labelをベースにしたキーを生成
                    const fieldKey = f.code || `label_${f.label ? f.label.replace(/[^a-zA-Z0-9]/g, '_') : 'unknown'}`;
                    currentGroup.fields[fieldKey] = {
                      code: f.code || fieldKey,
                      label: f.label,
                      type: f.type
                    };
                  }
                }
              }
            }
          }
        }

        walkLayout(layoutResponse.layout || [], null);

        // レイアウトからLABELフィールドを収集
        const layoutLabels = {};
        function collectLabels(nodes) {
          for (const node of nodes) {
            if (node.type === 'ROW') {
              for (const f of (node.fields || [])) {
                if (f.type === 'LABEL') {
                  const fieldKey = f.code || `label_${f.label ? f.label.replace(/[^a-zA-Z0-9]/g, '_') : 'unknown'}`;
                  layoutLabels[fieldKey] = {
                    code: f.code || fieldKey,
                    label: f.label,
                    type: f.type,
                    required: false,
                    description: '',
                    fromLayout: true // レイアウトから取得したことを示すフラグ
                  };
                }
              }
            } else if (node.layout) {
              collectLabels(node.layout);
            }
          }
        }
        collectLabels(layoutResponse.layout || []);

        // レイアウトから取得したLABELフィールドをスキーマに追加
        console.log('レイアウトから収集されたLABELフィールド:', layoutLabels);
        Object.keys(layoutLabels).forEach(labelCode => {
          const labelField = layoutLabels[labelCode];
          if (!schema[labelCode]) {
            console.log(`LABELフィールド ${labelCode} をスキーマに追加`);
            schema[labelCode] = labelField;
          }
        });

        // グループフィールドの詳細情報をスキーマに追加
        console.log('収集されたグループフィールド情報:', groupFields);
        Object.keys(schema).forEach(fieldCode => {
          const field = schema[fieldCode];
          if (field.type === 'GROUP' && groupFields[fieldCode]) {
            console.log(`グループフィールド ${fieldCode} の詳細情報を追加`);
            const groupInfo = groupFields[fieldCode];

            // グループフィールドのfieldsプロパティを設定
            field.fields = groupInfo.fields;
            console.log(`グループフィールド ${fieldCode} の内部フィールド数:`, Object.keys(groupInfo.fields).length);
            console.log(`グループフィールド ${fieldCode} の内部フィールド詳細:`, groupInfo.fields);

            // グループフィールドの詳細情報も追加
            Object.assign(field, {
              groupCode: groupInfo.groupCode,
              groupLabel: groupInfo.groupLabel
            });
          } else if (field.type === 'GROUP' && !groupFields[fieldCode]) {
            console.warn(`グループフィールド ${fieldCode} の情報が見つかりません`);
          }
        });
      }

      return schema;
    } catch (error) {
      console.error('スキーマ取得エラー:', error);
      throw error;
    }
  };

  /**
   * 指定件数のレコードを取得
   */
  const getRecords = async (appId, recordCount) => {
    try {
      const query = `limit ${recordCount}`;
      const response = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', {
        app: appId,
        query: query
      });
      return response.records;
    } catch (error) {
      console.error('レコード取得エラー:', error);
      throw error;
    }
  };

  // グローバル関数として公開
  window.KintoneAPI = {
    getCurrentAppInfo,
    getAllAppsInSpace,
    getAppIdByName,
    getAppNameById,
    getAppSchema,
    getRecords
  };

  console.log('Kintone API スクリプトが読み込まれました');

})();
