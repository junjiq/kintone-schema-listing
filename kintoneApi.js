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
   * アプリのフォーム情報（スキーマ）を取得
   */
  const getAppSchema = async (appId) => {
    try {
      const response = await kintone.api(kintone.api.url('/k/v1/app/form/fields.json', true), 'GET', {
        app: appId
      });
      return response.properties;
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
    getAppSchema,
    getRecords
  };

  console.log('Kintone API スクリプトが読み込まれました');

})();
