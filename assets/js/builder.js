/**
 * builder.js
 * 
 * クイズビルダーの編集機能
 */

// =====================================
// 📋 問題リスト表示
// =====================================

/**
 * 問題リストをHTMLで描画
 */
function renderQuestionList() {
  console.log('📋 問題リスト描画開始');
  
  const container = document.getElementById('question-list');
  
  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>📝 問題がまだありません</h3>
        <p>下のボタンから問題を追加してください</p>
        <button class="btn btn-primary" onclick="addNewQuestion()">➕ 新しい問題を追加</button>
      </div>
    `;
    return;
  }
  
  let html = '<div class="question-items">';
  
  quizData.questions.forEach((q, index) => {
    const typeLabel = q.type === 'choice' ? '4択' : 'テキスト';
    const typeClass = q.type === 'choice' ? 'type-choice' : 'type-text';
    
    // 質問文を短く表示（30文字まで）
    const shortQuestion = q.question.length > 30 
      ? q.question.substring(0, 30) + '...' 
      : q.question;
    
    html += `
      <div class="question-item" data-index="${index}">
        <div class="question-header">
          <span class="question-type ${typeClass}">${typeLabel}</span>
          <span class="question-id">#${q.id}</span>
        </div>
        <div class="question-text">${shortQuestion}</div>
        <div class="question-actions">
          <button class="btn-icon" onclick="editQuestion(${index})" title="編集">✏️</button>
          <button class="btn-icon" onclick="duplicateQuestion(${index})" title="複製">📋</button>
          <button class="btn-icon" onclick="deleteQuestion(${index})" title="削除">🗑️</button>
          <button class="btn-icon" onclick="moveQuestionUp(${index})" title="上へ" ${index === 0 ? 'disabled' : ''}>⬆️</button>
          <button class="btn-icon" onclick="moveQuestionDown(${index})" title="下へ" ${index === quizData.questions.length - 1 ? 'disabled' : ''}>⬇️</button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  // 問題追加ボタン
  html += `
    <div class="add-question-area">
      <button class="btn btn-primary btn-block" onclick="addNewQuestion()">➕ 新しい問題を追加</button>
    </div>
  `;
  
  container.innerHTML = html;
  
  console.log(`✅ 問題リスト描画完了: ${quizData.questions.length}問`);
  
  // 書き出し情報も更新
  if (typeof updateExportInfo !== 'undefined') {
    updateExportInfo();
  }
}

// =====================================
// ✏️ 問題の操作
// =====================================

/**
 * 新しい問題を追加
 */
function addNewQuestion() {
  console.log('➕ 新しい問題追加');
  
  // デフォルトで choice 型の問題を追加
  const newQuestion = {
    id: `q${Date.now()}`,
    type: 'choice',
    question: '新しい問題',
    choices: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
    answer: 0,
    explanation: ''
  };
  
  quizData.questions.push(newQuestion);
  renderQuestionList();
  updatePreview();
  
  // 追加した問題を編集モードに
  editQuestion(quizData.questions.length - 1);
}

/**
 * 問題を編集
 * 
 * @param {number} index - 問題のインデックス
 */
function editQuestion(index) {
  console.log(`✏️ 問題を編集: ${index}`);
  openEditModal(index);
}

/**
 * 問題を複製
 * 
 * @param {number} index - 問題のインデックス
 */
function duplicateQuestion(index) {
  console.log(`📋 問題を複製: ${index}`);
  
  const original = quizData.questions[index];
  const copy = JSON.parse(JSON.stringify(original)); // ディープコピー
  copy.id = `q${Date.now()}`;
  copy.question = copy.question + '（コピー）';
  
  quizData.questions.splice(index + 1, 0, copy);
  renderQuestionList();
  updatePreview();
  
  alert(`✅ 問題を複製しました`);
}

/**
 * 問題を削除
 * 
 * @param {number} index - 問題のインデックス
 */
function deleteQuestion(index) {
  console.log(`🗑️ 問題を削除: ${index}`);
  
  const question = quizData.questions[index];
  const confirmed = confirm(`本当に削除しますか？\n\n「${question.question}」`);
  
  if (confirmed) {
    quizData.questions.splice(index, 1);
    renderQuestionList();
    updatePreview();
    alert(`✅ 問題を削除しました`);
  }
}

/**
 * 問題を上に移動
 * 
 * @param {number} index - 問題のインデックス
 */
function moveQuestionUp(index) {
  if (index === 0) return;
  
  console.log(`⬆️ 問題を上に移動: ${index}`);
  
  const temp = quizData.questions[index];
  quizData.questions[index] = quizData.questions[index - 1];
  quizData.questions[index - 1] = temp;
  
  renderQuestionList();
  updatePreview();
}

/**
 * 問題を下に移動
 * 
 * @param {number} index - 問題のインデックス
 */
function moveQuestionDown(index) {
  if (index === quizData.questions.length - 1) return;
  
  console.log(`⬇️ 問題を下に移動: ${index}`);
  
  const temp = quizData.questions[index];
  quizData.questions[index] = quizData.questions[index + 1];
  quizData.questions[index + 1] = temp;
  
  renderQuestionList();
  updatePreview();
}

// =====================================
// 👁️ プレビュー更新
// =====================================

/**
 * プレビューを更新
 */
function updatePreview() {
  console.log('👁️ プレビュー更新');
  
  const previewArea = document.getElementById('preview-area');
  
  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    previewArea.innerHTML = `
      <div class="placeholder">
        <h3>プレビュー</h3>
        <p>問題を追加するとプレビューが表示されます</p>
      </div>
    `;
    return;
  }
  
  // 簡易プレビュー（最初の問題のみ）
  const firstQuestion = quizData.questions[0];
  let previewHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h3 style="color: #2c3e50;">${quizData.meta.title || 'クイズ'}</h3>
      <p style="color: #7f8c8d;">全${quizData.questions.length}問</p>
    </div>
    <div style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
      <h4 style="margin-bottom: 15px;">問題1</h4>
      <p style="font-size: 18px; margin-bottom: 20px;">${firstQuestion.question}</p>
  `;
  
  if (firstQuestion.type === 'choice') {
    previewHTML += '<div style="display: flex; flex-direction: column; gap: 10px;">';
    firstQuestion.choices.forEach((choice, i) => {
      previewHTML += `
        <div style="padding: 12px; background: white; border: 2px solid #3498db; border-radius: 8px;">
          ${choice}
        </div>
      `;
    });
    previewHTML += '</div>';
  } else {
    previewHTML += `
      <input type="text" placeholder="答えを入力してください" style="width: 100%; padding: 12px; border: 2px solid #bdc3c7; border-radius: 8px;">
    `;
  }
  
  previewHTML += '</div>';
  
  if (quizData.questions.length > 1) {
    previewHTML += `
      <p style="text-align: center; margin-top: 20px; color: #7f8c8d;">
        ... 他${quizData.questions.length - 1}問
      </p>
    `;
  }
  
  previewArea.innerHTML = previewHTML;
}

// =====================================
// ✏️ 問題編集モーダル
// =====================================

let editingQuestionIndex = -1;

/**
 * 編集モーダルを開く
 * 
 * @param {number} index - 編集する問題のインデックス
 */
function openEditModal(index) {
  console.log(`✏️ 編集モーダルを開く: ${index}`);
  
  editingQuestionIndex = index;
  const question = quizData.questions[index];
  
  // フォームに値をセット
  document.getElementById('edit-type').value = question.type;
  document.getElementById('edit-question').value = question.question;
  document.getElementById('edit-explanation').value = question.explanation || '';
  
  if (question.type === 'choice') {
    // choice型の場合
    document.getElementById('edit-choice-0').value = question.choices[0];
    document.getElementById('edit-choice-1').value = question.choices[1];
    document.getElementById('edit-choice-2').value = question.choices[2];
    document.getElementById('edit-choice-3').value = question.choices[3];
    
    // 正解のラジオボタンをチェック
    document.querySelector(`input[name="correct-answer"][value="${question.answer}"]`).checked = true;
  } else {
    // text型の場合
    document.getElementById('edit-text-answer').value = question.answer;
  }
  
  // 問題タイプに応じて表示を切り替え
  toggleQuestionType();
  
  // モーダルを表示
  document.getElementById('edit-modal').classList.add('show');
}

/**
 * 編集モーダルを閉じる
 */
function closeEditModal() {
  console.log('❌ 編集モーダルを閉じる');
  document.getElementById('edit-modal').classList.remove('show');
  editingQuestionIndex = -1;
}

/**
 * 問題タイプに応じて表示を切り替え
 */
function toggleQuestionType() {
  const type = document.getElementById('edit-type').value;
  
  if (type === 'choice') {
    document.getElementById('choices-area').style.display = 'block';
    document.getElementById('text-answer-area').style.display = 'none';
  } else {
    document.getElementById('choices-area').style.display = 'none';
    document.getElementById('text-answer-area').style.display = 'block';
  }
}

/**
 * 問題を保存
 */
function saveQuestion() {
  console.log('💾 問題を保存');
  
  // フォームから値を取得
  const type = document.getElementById('edit-type').value;
  const question = document.getElementById('edit-question').value.trim();
  const explanation = document.getElementById('edit-explanation').value.trim();
  
  // バリデーション
  if (!question) {
    alert('⚠️ 問題文を入力してください');
    return;
  }
  
  const updatedQuestion = {
    id: quizData.questions[editingQuestionIndex].id,
    type: type,
    question: question,
    explanation: explanation
  };
  
  if (type === 'choice') {
    // choice型の場合
    const choices = [
      document.getElementById('edit-choice-0').value.trim(),
      document.getElementById('edit-choice-1').value.trim(),
      document.getElementById('edit-choice-2').value.trim(),
      document.getElementById('edit-choice-3').value.trim()
    ];
    
    // バリデーション
    if (choices.some(c => !c)) {
      alert('⚠️ 全ての選択肢を入力してください');
      return;
    }
    
    const correctAnswer = document.querySelector('input[name="correct-answer"]:checked');
    if (!correctAnswer) {
      alert('⚠️ 正解を選択してください');
      return;
    }
    
    updatedQuestion.choices = choices;
    updatedQuestion.answer = parseInt(correctAnswer.value);
  } else {
    // text型の場合
    const answer = document.getElementById('edit-text-answer').value.trim();
    
    if (!answer) {
      alert('⚠️ 正解を入力してください');
      return;
    }
    
    updatedQuestion.answer = answer;
  }
  
  // データを更新
  quizData.questions[editingQuestionIndex] = updatedQuestion;
  
  // 画面を更新
  renderQuestionList();
  updatePreview();
  closeEditModal();
  
  alert('✅ 問題を保存しました');
}

// =====================================
// 🎓 初級者向け説明コーナー
// =====================================

/**
 * 【splice とは】
 * 
 * 配列の要素を追加・削除するメソッド
 * 
 * array.splice(開始位置, 削除数, 追加要素)
 * 
 * 例：
 * const arr = [1, 2, 3, 4];
 * arr.splice(1, 1);  // [1, 3, 4] (2を削除)
 * arr.splice(1, 0, 99);  // [1, 99, 3, 4] (1の後に99を挿入)
 */

/**
 * 【JSON.parse と JSON.stringify】
 * 
 * ディープコピー（完全な複製）を作る方法
 * 
 * const original = { name: "太郎", age: 25 };
 * const copy = JSON.parse(JSON.stringify(original));
 * 
 * copy.name = "次郎";  // originalは変わらない
 */

/**
 * 【confirm とは】
 * 
 * 確認ダイアログを表示
 * 
 * const result = confirm("本当に削除しますか？");
 * // OK → true
 * // キャンセル → false
 */

// builder.js に以下の変数とグローバル関数を追加してください

// =====================================
// 🖼️ 画像管理用グローバル変数
// =====================================

let currentQuestionImage = ''; // 編集中の問題画像
let currentChoiceImages = ['', '', '', '']; // 編集中の選択肢画像

// =====================================
// 🖼️ 画像アップロード関数
// =====================================

/**
 * 問題画像をアップロード
 */
function uploadQuestionImage() {
  console.log('🖼️ 問題画像をアップロード');
  
  selectAndResizeImage((base64Image) => {
    currentQuestionImage = base64Image;
    
    // プレビューを更新
    const previewContainer = document.getElementById('question-image-preview');
    if (previewContainer) {
      previewContainer.innerHTML = createImagePreviewWithDelete(
        base64Image, 
        'delete-question-image'
      );
      
      // 削除ボタンのイベント設定
      const deleteBtn = document.getElementById('delete-question-image');
      if (deleteBtn) {
        deleteBtn.onclick = deleteQuestionImage;
      }
    }
    
    console.log('✅ 問題画像を設定しました');
  }, 800, 600);
}

/**
 * 問題画像をURLで追加
 */
function uploadQuestionImageByURL() {
  console.log('🔗 問題画像をURLで追加');
  
  addImageByURL((url) => {
    currentQuestionImage = url;
    
    const previewContainer = document.getElementById('question-image-preview');
    if (previewContainer) {
      previewContainer.innerHTML = createImagePreviewWithDelete(
        url, 
        'delete-question-image'
      );
      
      const deleteBtn = document.getElementById('delete-question-image');
      if (deleteBtn) {
        deleteBtn.onclick = deleteQuestionImage;
      }
    }
    
    console.log('✅ 問題画像(URL)を設定しました');
  });
}

/**
 * 問題画像を削除
 */
function deleteQuestionImage() {
  console.log('🗑️ 問題画像を削除');
  
  currentQuestionImage = '';
  
  const previewContainer = document.getElementById('question-image-preview');
  if (previewContainer) {
    previewContainer.innerHTML = '<p class="no-image">画像なし</p>';
  }
}

/**
 * 選択肢画像をアップロード
 * 
 * @param {number} index - 選択肢のインデックス(0〜3)
 */
function uploadChoiceImage(index) {
  console.log(`🖼️ 選択肢${index + 1}の画像をアップロード`);
  
  selectAndResizeImage((base64Image) => {
    currentChoiceImages[index] = base64Image;
    
    // プレビューを更新
    const previewContainer = document.getElementById(`choice-image-preview-${index}`);
    if (previewContainer) {
      previewContainer.innerHTML = createImagePreviewWithDelete(
        base64Image,
        `delete-choice-image-${index}`
      );
      
      // 削除ボタンのイベント設定
      const deleteBtn = document.getElementById(`delete-choice-image-${index}`);
      if (deleteBtn) {
        deleteBtn.onclick = () => deleteChoiceImage(index);
      }
    }
    
    console.log(`✅ 選択肢${index + 1}の画像を設定しました`);
  }, 400, 300);
}

/**
 * 選択肢画像を削除
 * 
 * @param {number} index - 選択肢のインデックス(0〜3)
 */
function deleteChoiceImage(index) {
  console.log(`🗑️ 選択肢${index + 1}の画像を削除`);
  
  currentChoiceImages[index] = '';
  
  const previewContainer = document.getElementById(`choice-image-preview-${index}`);
  if (previewContainer) {
    previewContainer.innerHTML = '<p class="no-image-small">画像なし</p>';
  }
}

// =====================================
// 📝 既存の openEditModal 関数を更新
// =====================================

/**
 * 編集モーダルを開く(画像対応版)
 * 
 * @param {number} index - 編集する問題のインデックス
 */
function openEditModal(index) {
  console.log(`✏️ 編集モーダルを開く: ${index}`);
  
  editingQuestionIndex = index;
  const question = quizData.questions[index];
  
  // フォームに値をセット
  document.getElementById('edit-type').value = question.type;
  document.getElementById('edit-question').value = question.question;
  document.getElementById('edit-explanation').value = question.explanation || '';
  
  // 🆕 問題画像を設定
  currentQuestionImage = question.image || '';
  const questionImagePreview = document.getElementById('question-image-preview');
  if (questionImagePreview) {
    if (currentQuestionImage) {
      questionImagePreview.innerHTML = createImagePreviewWithDelete(
        currentQuestionImage,
        'delete-question-image'
      );
      
      const deleteBtn = document.getElementById('delete-question-image');
      if (deleteBtn) {
        deleteBtn.onclick = deleteQuestionImage;
      }
    } else {
      questionImagePreview.innerHTML = '<p class="no-image">画像なし</p>';
    }
  }
  
  if (question.type === 'choice') {
    // choice型の場合
    document.getElementById('edit-choice-0').value = question.choices[0];
    document.getElementById('edit-choice-1').value = question.choices[1];
    document.getElementById('edit-choice-2').value = question.choices[2];
    document.getElementById('edit-choice-3').value = question.choices[3];
    
    // 正解のラジオボタンをチェック
    document.querySelector(`input[name="correct-answer"][value="${question.answer}"]`).checked = true;
    
    // 🆕 選択肢画像を設定
    currentChoiceImages = question.choiceImages || ['', '', '', ''];
    for (let i = 0; i < 4; i++) {
      const choiceImagePreview = document.getElementById(`choice-image-preview-${i}`);
      if (choiceImagePreview) {
        if (currentChoiceImages[i]) {
          choiceImagePreview.innerHTML = createImagePreviewWithDelete(
            currentChoiceImages[i],
            `delete-choice-image-${i}`
          );
          
          const deleteBtn = document.getElementById(`delete-choice-image-${i}`);
          if (deleteBtn) {
            deleteBtn.onclick = () => deleteChoiceImage(i);
          }
        } else {
          choiceImagePreview.innerHTML = '<p class="no-image-small">画像なし</p>';
        }
      }
    }
  } else {
    // text型の場合
    const answer = Array.isArray(question.answer) ? question.answer[0] : question.answer;
    document.getElementById('edit-text-answer').value = answer;
  }
  
  // 問題タイプに応じて表示を切り替え
  toggleQuestionType();
  
  // モーダルを表示
  document.getElementById('edit-modal').classList.add('show');
}

// =====================================
// 💾 既存の saveQuestion 関数を更新
// =====================================

/**
 * 問題を保存(画像対応版)
 */
function saveQuestion() {
  console.log('💾 問題を保存');
  
  const type = document.getElementById('edit-type').value;
  const question = document.getElementById('edit-question').value.trim();
  const explanation = document.getElementById('edit-explanation').value.trim();
  
  if (!question) {
    alert('⚠️ 問題文を入力してください');
    return;
  }
  
  const updatedQuestion = {
    id: quizData.questions[editingQuestionIndex].id,
    type: type,
    question: question,
    image: currentQuestionImage, // 🆕 画像を保存
    explanation: explanation
  };
  
  if (type === 'choice') {
    const choices = [
      document.getElementById('edit-choice-0').value.trim(),
      document.getElementById('edit-choice-1').value.trim(),
      document.getElementById('edit-choice-2').value.trim(),
      document.getElementById('edit-choice-3').value.trim()
    ];
    
    if (choices.some(c => !c)) {
      alert('⚠️ 全ての選択肢を入力してください');
      return;
    }
    
    const correctAnswer = document.querySelector('input[name="correct-answer"]:checked');
    if (!correctAnswer) {
      alert('⚠️ 正解を選択してください');
      return;
    }
    
    updatedQuestion.choices = choices;
    updatedQuestion.choiceImages = currentChoiceImages; // 🆕 選択肢画像を保存
    updatedQuestion.answer = parseInt(correctAnswer.value);
  } else {
    const answer = document.getElementById('edit-text-answer').value.trim();
    
    if (!answer) {
      alert('⚠️ 正解を入力してください');
      return;
    }
    
    updatedQuestion.answer = answer;
  }
  
  quizData.questions[editingQuestionIndex] = updatedQuestion;
  
  renderQuestionList();
  updatePreview();
  closeEditModal();
  
  alert('✅ 問題を保存しました');
}

// =====================================
// ➕ 新規問題追加時も画像初期化
// =====================================

/**
 * 新しい問題を追加(画像対応版)
 */
function addNewQuestion() {
  console.log('➕ 新しい問題追加');
  
  const newQuestion = {
    id: `q${Date.now()}`,
    type: 'choice',
    question: '新しい問題',
    image: '', // 🆕 画像初期化
    choices: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
    choiceImages: ['', '', '', ''], // 🆕 選択肢画像初期化
    answer: 0,
    explanation: ''
  };
  
  quizData.questions.push(newQuestion);
  renderQuestionList();
  updatePreview();
  
  editQuestion(quizData.questions.length - 1);
}

// =====================================
// 🔍 デバッグ用
// =====================================

if (typeof window !== 'undefined') {
  window.uploadQuestionImage = uploadQuestionImage;
  window.uploadQuestionImageByURL = uploadQuestionImageByURL;
  window.deleteQuestionImage = deleteQuestionImage;
  window.uploadChoiceImage = uploadChoiceImage;
  window.deleteChoiceImage = deleteChoiceImage;
  console.log('✅ builder.js (画像対応) loaded');
  console.log('🔧 画像アップロード関数が利用可能です');
}







// =====================================
// 🔍 デバッグ用
// =====================================

if (typeof window !== 'undefined') {
  window.renderQuestionList = renderQuestionList;
  window.addNewQuestion = addNewQuestion;
  window.editQuestion = editQuestion;
  window.duplicateQuestion = duplicateQuestion;
  window.deleteQuestion = deleteQuestion;
  window.moveQuestionUp = moveQuestionUp;
  window.moveQuestionDown = moveQuestionDown;
  window.updatePreview = updatePreview;
  window.openEditModal = openEditModal;
  window.closeEditModal = closeEditModal;
  window.toggleQuestionType = toggleQuestionType;
  window.saveQuestion = saveQuestion;
  console.log('✅ builder.js loaded');
}


