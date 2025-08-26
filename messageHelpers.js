(() => {
  'use strict';

  /**
   * メッセージ表示関連の機能
   */

  /**
   * メッセージ表示関数
   */
  const showMessage = (message, type = 'info') => {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.padding = '10px';
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.marginBottom = '10px';
    messageDiv.style.fontWeight = 'bold';
    messageDiv.classList.add('temp-message');

    // タイプに応じてスタイルを設定
    if (type === 'error') {
      messageDiv.style.backgroundColor = '#f8d7da';
      messageDiv.style.color = '#721c24';
      messageDiv.style.border = '1px solid #f5c6cb';
    } else if (type === 'success') {
      messageDiv.style.backgroundColor = '#d4edda';
      messageDiv.style.color = '#155724';
      messageDiv.style.border = '1px solid #c3e6cb';
    } else {
      messageDiv.style.backgroundColor = '#cce7ff';
      messageDiv.style.color = '#004085';
      messageDiv.style.border = '1px solid #b3d7ff';
    }

    // 既存のメッセージを削除
    const existingMessage = document.querySelector('.temp-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // メッセージをクエリUIの上に挿入
    const queryUI = document.getElementById('query-ui');
    if (queryUI && queryUI.parentNode) {
      queryUI.parentNode.insertBefore(messageDiv, queryUI);
    } else {
      document.body.insertBefore(messageDiv, document.body.firstChild);
    }

    // 5秒後に自動削除
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  };

  // グローバル関数として公開
  window.MessageHelpers = {
    showMessage
  };

  console.log('メッセージヘルパー スクリプトが読み込まれました');

})();
