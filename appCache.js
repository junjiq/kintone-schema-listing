(() => {
  'use strict';

  /**
   * アプリ名キャッシュ関連の機能
   */

  // アプリ名キャッシュ（キーは文字列化した appId）
  const appNameCache = {};

  /**
   * アプリ名をキャッシュから取得、なければ「アプリID: [ID]」を返す
   */
  /**
   * 指定アプリIDの表示名を取得（キャッシュ優先）。
   * @param {string|number} appId
   * @returns {string}
   */
  const getAppDisplayName = (appId) => {
    const key = String(appId);
    if (appNameCache[key]) {
      return `${appNameCache[key]} (${key})`;
    }
    return `アプリID: ${key}`;
  };

  /**
   * アプリ名キャッシュを更新
   */
  /**
   * スペース内アプリ一覧からアプリ名キャッシュを更新。
   * 取得失敗時は警告ログのみ（既存キャッシュは保持）。
   */
  const updateAppNameCache = async () => {
    try {
      const apps = await KintoneAPI.getAllAppsInSpace();
      apps.forEach(app => {
        const key = String(app.appId);
        appNameCache[key] = app.name;
      });
      console.log('アプリ名キャッシュを更新しました:', appNameCache);
    } catch (error) {
      console.warn('アプリ名キャッシュの更新に失敗:', error);
    }
  };

  // グローバル関数として公開
  window.AppCache = {
    getAppDisplayName,
    updateAppNameCache,
    appNameCache // キャッシュも公開
  };

  console.log('アプリキャッシュ スクリプトが読み込まれました');

})();
