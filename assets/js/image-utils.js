/**
 * image-utils.js
 * 
 * 画像のアップロード・変換・プレビュー機能
 */

// =====================================
// 🖼️ 画像選択とBase64変換
// =====================================

/**
 * 画像ファイルを選択してBase64に変換
 * 
 * @param {Function} callback - 変換後のBase64文字列を受け取るコールバック関数
 */
function selectAndConvertImage(callback) {
  console.log('🖼️ 画像選択開始');
  
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*'; // 画像ファイルのみ
  
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      convertImageToBase64(file, callback);
    }
  };
  
  input.click();
}

/**
 * 画像ファイルをBase64に変換
 * 
 * @param {File} file - 画像ファイル
 * @param {Function} callback - 変換後のBase64文字列を受け取るコールバック関数
 */
function convertImageToBase64(file, callback) {
  console.log('🔄 Base64変換開始:', file.name);
  
  // ファイルサイズチェック(5MB制限)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    alert(`⚠️ 画像サイズが大きすぎます\n\nファイルサイズ: ${(file.size / 1024 / 1024).toFixed(2)}MB\n制限: 5MB\n\n小さい画像を選択してください。`);
    return;
  }
  
  // 画像形式チェック
  if (!file.type.startsWith('image/')) {
    alert('❌ 画像ファイルを選択してください');
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = (event) => {
    const base64String = event.target.result;
    console.log('✅ Base64変換完了');
    console.log(`📊 データサイズ: ${(base64String.length / 1024).toFixed(2)}KB`);
    
    callback(base64String);
  };
  
  reader.onerror = () => {
    console.error('❌ 画像読み込みエラー');
    alert('❌ 画像の読み込みに失敗しました');
  };
  
  // Base64として読み込む
  reader.readAsDataURL(file);
}

// =====================================
// 🎨 画像プレビュー
// =====================================

/**
 * 画像のプレビューHTMLを生成
 * 
 * @param {string} imageData - Base64またはURL
 * @param {string} alt - 代替テキスト
 * @param {string} className - CSSクラス名
 * @returns {string} img要素のHTML
 */
function createImagePreview(imageData, alt = '画像', className = 'question-image') {
  if (!imageData) {
    return '';
  }
  
  return `<img src="${imageData}" alt="${alt}" class="${className}">`;
}

/**
 * 画像削除ボタン付きプレビューを生成
 * 
 * @param {string} imageData - Base64またはURL
 * @param {string} deleteButtonId - 削除ボタンのID
 * @returns {string} プレビューHTML
 */
function createImagePreviewWithDelete(imageData, deleteButtonId) {
  if (!imageData) {
    return '<p class="no-image">画像なし</p>';
  }
  
  return `
    <div class="image-preview-container">
      <img src="${imageData}" alt="プレビュー" class="image-preview">
      <button type="button" class="btn-delete-image" id="${deleteButtonId}">
        🗑️ 削除
      </button>
    </div>
  `;
}

// =====================================
// 📏 画像リサイズ(オプション)
// =====================================

/**
 * 画像を指定サイズにリサイズ
 * 
 * @param {string} base64Image - Base64画像データ
 * @param {number} maxWidth - 最大幅
 * @param {number} maxHeight - 最大高さ
 * @param {Function} callback - リサイズ後のBase64を受け取るコールバック
 */
function resizeImage(base64Image, maxWidth, maxHeight, callback) {
  console.log('📏 画像リサイズ開始');
  
  const img = new Image();
  
  img.onload = () => {
    let width = img.width;
    let height = img.height;
    
    // アスペクト比を維持しながらリサイズ
    if (width > maxWidth || height > maxHeight) {
      const aspectRatio = width / height;
      
      if (width > height) {
        width = maxWidth;
        height = width / aspectRatio;
      } else {
        height = maxHeight;
        width = height * aspectRatio;
      }
    }
    
    // Canvasで描画
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    // Base64に変換
    const resizedBase64 = canvas.toDataURL('image/jpeg', 0.9);
    
    console.log('✅ リサイズ完了');
    console.log(`📊 元サイズ: ${img.width}x${img.height}`);
    console.log(`📊 新サイズ: ${width}x${height}`);
    
    callback(resizedBase64);
  };
  
  img.onerror = () => {
    console.error('❌ 画像読み込みエラー');
    alert('❌ 画像のリサイズに失敗しました');
  };
  
  img.src = base64Image;
}

/**
 * 画像を自動リサイズしてから追加
 * 
 * @param {Function} callback - リサイズ後のBase64を受け取るコールバック
 * @param {number} maxWidth - 最大幅(デフォルト: 800px)
 * @param {number} maxHeight - 最大高さ(デフォルト: 600px)
 */
function selectAndResizeImage(callback, maxWidth = 800, maxHeight = 600) {
  selectAndConvertImage((base64Image) => {
    resizeImage(base64Image, maxWidth, maxHeight, callback);
  });
}

// =====================================
// 🔗 URL形式の画像を追加
// =====================================

/**
 * URL形式で画像を追加
 * 
 * @param {Function} callback - 入力されたURLを受け取るコールバック
 */
function addImageByURL(callback) {
  const url = prompt('画像のURLを入力してください:\n\n例: https://example.com/image.jpg');
  
  if (!url) {
    console.log('❌ キャンセルされました');
    return;
  }
  
  // URLの簡易検証
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    alert('❌ 有効なURLを入力してください\n\nhttp:// または https:// で始まる必要があります');
    return;
  }
  
  console.log('🔗 URL形式の画像を追加:', url);
  callback(url);
}

// =====================================
// 🎓 初級者向け説明コーナー
// =====================================

/**
 * 【Base64とは】
 * 
 * バイナリデータ(画像など)を文字列に変換する方式
 * 
 * メリット:
 * - HTMLに直接埋め込める
 * - 外部ファイル不要
 * - WordPressにコピペするだけで動作
 * 
 * デメリット:
 * - ファイルサイズが約1.3倍になる
 * - 大きな画像は読み込みが遅くなる
 * 
 * 形式:
 * data:image/png;base64,iVBORw0KGgoAAAANS...
 * ~~~~~~ ~~~~~~~~        ~~~~~~~~~~~~~~~~~~~
 *   ↑      ↑                  ↑
 * スキーマ 形式          Base64エンコードされたデータ
 */

/**
 * 【FileReaderとreadAsDataURL】
 * 
 * ファイルをBase64形式で読み込む
 * 
 * const reader = new FileReader();
 * reader.onload = (event) => {
 *   const base64 = event.target.result;
 *   // "data:image/png;base64,..." の形式
 * };
 * reader.readAsDataURL(file); // Base64に変換
 */

/**
 * 【Canvasでの画像リサイズ】
 * 
 * 1. Image要素で画像を読み込む
 * 2. Canvasに縮小して描画
 * 3. toDataURL()でBase64に変換
 * 
 * const img = new Image();
 * img.onload = () => {
 *   const canvas = document.createElement('canvas');
 *   canvas.width = 800;  // 新しい幅
 *   canvas.height = 600; // 新しい高さ
 *   
 *   const ctx = canvas.getContext('2d');
 *   ctx.drawImage(img, 0, 0, 800, 600);
 *   
 *   const resized = canvas.toDataURL('image/jpeg');
 * };
 * img.src = originalBase64;
 */

/**
 * 【コールバック関数とは】
 * 
 * 処理が完了したときに呼び出される関数
 * 
 * 非同期処理で使用:
 * selectAndConvertImage((base64) => {
 *   // 変換完了後にこの関数が実行される
 *   console.log('変換完了:', base64);
 * });
 * 
 * 処理の流れ:
 * 1. selectAndConvertImage()を呼び出す
 * 2. ユーザーが画像を選択
 * 3. 変換処理が完了
 * 4. コールバック関数が実行される
 */

// =====================================
// 🔍 デバッグ用
// =====================================

if (typeof window !== 'undefined') {
  window.selectAndConvertImage = selectAndConvertImage;
  window.selectAndResizeImage = selectAndResizeImage;
  window.addImageByURL = addImageByURL;
  window.createImagePreview = createImagePreview;
  window.createImagePreviewWithDelete = createImagePreviewWithDelete;
  window.resizeImage = resizeImage;
  console.log('✅ image-utils.js loaded');
  console.log('🔧 selectAndConvertImage関数が利用可能です');
  console.log('🔧 selectAndResizeImage関数が利用可能です(自動リサイズ)');
  console.log('🔧 addImageByURL関数が利用可能です');
}