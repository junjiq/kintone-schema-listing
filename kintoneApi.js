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
      const appName = kintone.app.getName();
      return { appId, appName };
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
        layoutResponse = await kintone.api(kintone.api.url('/k/v1/app/form/layout.json', true), 'GET', {
          app: appId
        });
                 // レイアウト情報からグループフィールドの詳細を確認
         if (layoutResponse.layout) {
           layoutResponse.layout.forEach((row, rowIndex) => {
             if (row.fields) {
               row.fields.forEach((field, fieldIndex) => {
                 if (field.type === 'GROUP') {
                   console.log(`レイアウト内のグループフィールド ${field.code} を検出`);
                 }
               });
             }
           });
         }
      } catch (layoutError) {
        console.warn('フォームレイアウト情報の取得に失敗:', layoutError);
      }

      // グループフィールドの詳細情報を取得するために、フィールド設定APIを試す
      try {
        const fieldResponse = await kintone.api(kintone.api.url('/k/v1/app/form/fields.json', true), 'GET', {
          app: appId,
          lang: 'ja'
        });
                 // グループフィールドの詳細を確認
         if (fieldResponse.properties) {
           Object.keys(fieldResponse.properties).forEach(fieldCode => {
             const field = fieldResponse.properties[fieldCode];
             if (field.type === 'GROUP') {
               console.log(`フィールド設定内のグループフィールド ${fieldCode} を検出`);
             }
           });
         }
      } catch (fieldError) {
        console.warn('フィールド設定情報の取得に失敗:', fieldError);
      }

            // レイアウト情報からグループフィールドの詳細を推測
      if (layoutResponse && layoutResponse.layout) {
        const groupFields = {};

                 layoutResponse.layout.forEach((row, rowIndex) => {
                      // グループフィールドが直接rowオブジェクトとして存在する場合の処理
           if (row.type === 'GROUP') {
             console.log(`直接グループフィールド ${row.code} を処理中...`);
             groupFields[row.code] = row;

             // グループフィールドのlayoutから内部フィールド情報を取得
             if (row.layout && Array.isArray(row.layout)) {
               const internalFields = {};

               row.layout.forEach((internalRow, internalRowIndex) => {
                 if (internalRow.fields) {
                   internalRow.fields.forEach((internalField, internalFieldIndex) => {
                     internalFields[internalField.code] = internalField;
                   });
                 }
               });

               // 内部フィールド情報をグループフィールドに追加
               row.fields = internalFields;
               console.log(`直接グループフィールド ${row.code} の内部フィールド数:`, Object.keys(internalFields).length);
             }
           }

                      // 従来の処理：row.fields内のグループフィールドを処理（row.fieldsが配列の場合のみ）
           if (row.fields && Array.isArray(row.fields)) {
             row.fields.forEach((field, fieldIndex) => {
               if (field.type === 'GROUP') {
                 console.log(`グループフィールド ${field.code} を処理中...`);
                 groupFields[field.code] = field;

                 // グループフィールドのlayoutから内部フィールド情報を取得
                 if (field.layout && Array.isArray(field.layout)) {
                   const internalFields = {};

                   field.layout.forEach((internalRow, internalRowIndex) => {
                     if (internalRow.fields) {
                       internalRow.fields.forEach((internalField, internalFieldIndex) => {
                         internalFields[internalField.code] = internalField;
                       });
                     }
                   });

                   // 内部フィールド情報をグループフィールドに追加
                   field.fields = internalFields;
                   console.log(`グループフィールド ${field.code} の内部フィールド数:`, Object.keys(internalFields).length);
                 }
               }
             });
           }
         });

                 // グループフィールドの詳細情報をスキーマに追加
         Object.keys(schema).forEach(fieldCode => {
           const field = schema[fieldCode];
           if (field.type === 'GROUP' && groupFields[fieldCode]) {
             console.log(`グループフィールド ${fieldCode} の詳細情報を追加`);
             // レイアウト情報からグループフィールドの詳細を取得
             Object.assign(field, groupFields[fieldCode]);
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
