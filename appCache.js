(() => {
  'use strict';

  /**
   * アプリ名キャッシュ関連の機能
   */

  // アプリ名キャッシュ
  let appNameCache = {};

  /**
   * アプリ名をキャッシュから取得、なければ「アプリID: [ID]」を返す
   */
  const getAppDisplayName = (appId) => {
    if (appNameCache[appId]) {
      return `${appNameCache[appId]} (${appId})`;
    }
    return `アプリID: ${appId}`;
  };

  /**
   * アプリ名キャッシュを更新
   */
  const updateAppNameCache = async () => {
    try {
      const apps = await KintoneAPI.getAllAppsInSpace();
      apps.forEach(app => {
        appNameCache[app.appId] = app.name;
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
