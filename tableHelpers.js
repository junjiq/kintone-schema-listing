(() => {
  'use strict';

  /**
   * テーブル表示・リサイズ関連の機能
   */

  /**
   * テーブルカラムのリサイズ機能を追加
   */
  const makeTableResizable = (table) => {
    const headers = table.querySelectorAll('th');

    headers.forEach((header, index) => {
      // リサイズハンドルを作成
      const resizer = document.createElement('div');
      resizer.style.position = 'absolute';
      resizer.style.top = '0';
      resizer.style.right = '0';
      resizer.style.width = '5px';
      resizer.style.height = '100%';
      resizer.style.cursor = 'col-resize';
      resizer.style.backgroundColor = 'transparent';
      resizer.style.zIndex = '1';

      let isResizing = false;
      let startX = 0;
      let startWidth = 0;

      // マウスダウンイベント
      resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = header.offsetWidth;
        header.style.backgroundColor = '#e6f3ff';
        resizer.style.backgroundColor = '#0066cc';
        document.body.style.userSelect = 'none';
      });

      // マウスムーブイベント（ドキュメント全体）
      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const diff = e.clientX - startX;
        const newWidth = Math.max(50, startWidth + diff);
        header.style.width = newWidth + 'px';
      });

      // マウスアップイベント（ドキュメント全体）
      document.addEventListener('mouseup', () => {
        if (isResizing) {
          isResizing = false;
          header.style.backgroundColor = '';
          resizer.style.backgroundColor = 'transparent';
          document.body.style.userSelect = '';
        }
      });

      header.style.position = 'relative';
      header.appendChild(resizer);
    });
  };

  // グローバル関数として公開
  window.TableHelpers = {
    makeTableResizable
  };

  console.log('テーブルヘルパー スクリプトが読み込まれました');

})();
