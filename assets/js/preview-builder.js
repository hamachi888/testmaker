/**
 * preview-builder.js
 * 
 * ビルダー右サイドバーのプレビュー機能
 * - 問題一覧表示
 * - クイズ実行（1問ずつ / 一覧表示の両方に対応）
 * 
 * 右サイドバーの #preview-area に表示する
 */

// =====================================
// 📦 グローバル変数
// =====================================

/** プレビューの現在モード: 'default' | 'list' | 'quiz' */
let previewMode = 'default';

/** クイズ実行中の状態 */
let previewQuizState = {
  currentIndex: 0,      // 現在の問題番号（1問ずつ表示モード用）
  answers: {},          // ユーザーの回答 { questionId: answer }
  score: 0,             // 正解数
  answered: false,      // 現在の問題に回答済みか（1問ずつモード用）
  submitted: false      // 採点済みか（一覧モード用）
};

// =====================================
// 🔀 プレビューモード切り替え
// =====================================

/**
 * プレビューボタン押し時に呼ばれる。
 * default → list → quiz の順で切り替え。
 */
function togglePreviewMode() {
  if (previewMode === 'default') {
    previewMode = 'list';
    renderPreviewList();
  } else if (previewMode === 'list') {
    previewMode = 'quiz';
    initPreviewQuiz();
  } else {
    previewMode = 'default';
    // builder.js の updatePreview に戻す
    if (typeof updatePreview === 'function') {
      updatePreview();
    }
  }
}

// =====================================
// 📋 問題一覧表示
// =====================================

/**
 * 全問題の一覧を右サイドバーに表示する
 */
function renderPreviewList() {
  const area = document.getElementById('preview-area');
  if (!area) return;

  let html = `
    <div class="pb-toolbar">
      <span class="pb-mode-label">📋 問題一覧</span>
      <div class="pb-toolbar-buttons">
        <button class="pb-btn pb-btn-primary" onclick="previewMode='quiz'; initPreviewQuiz();">▶️ クイズ実行</button>
        <button class="pb-btn pb-btn-secondary" onclick="previewMode='default'; if(typeof updatePreview==='function') updatePreview();">← 戻る</button>
      </div>
    </div>
  `;

  quizData.questions.forEach((q, i) => {
    const typeLabel = q.type === 'choice' ? '選択式' : '記述式';
    const typeClass = q.type === 'choice' ? 'pb-type-choice' : 'pb-type-text';

    html += `<div class="pb-list-item">`;
    html += `  <div class="pb-list-header">`;
    html += `    <span class="pb-list-num">問題 ${i + 1}</span>`;
    html += `    <span class="pb-type-badge ${typeClass}">${typeLabel}</span>`;
    html += `  </div>`;
    html += `  <div class="pb-list-question">${q.question}</div>`;

    // 問題画像
    if (q.image) {
      html += `<img src="${q.image}" alt="問題画像" class="pb-list-image">`;
    }

    if (q.type === 'choice') {
      html += `<div class="pb-list-choices">`;
      q.choices.forEach((c, ci) => {
        const isCorrect = ci === parseInt(q.answer);
        html += `<div class="pb-list-choice ${isCorrect ? 'pb-list-choice-correct' : ''}">`;
        // 選択肢画像
        if (q.choiceImages && q.choiceImages[ci]) {
          html += `<img src="${q.choiceImages[ci]}" alt="${c}" class="pb-list-choice-img">`;
        }
        html += `<span>${c}${isCorrect ? ' ✓' : ''}</span></div>`;
      });
      html += `</div>`;
    } else {
      // text型：正解を表示（複数正解対応）
      const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
      if (q.answer2) answers.push(q.answer2);
      if (q.answer3) answers.push(q.answer3);
      html += `<div class="pb-list-answer"><strong>正解:</strong> ${answers.join(' / ')}</div>`;
    }

    if (q.explanation) {
      html += `<div class="pb-list-explanation">💡 ${q.explanation}</div>`;
    }

    html += `</div>`;
  });

  area.innerHTML = html;
}

// =====================================
// ▶️ クイズ実行（初期化）
// =====================================

/**
 * クイズ実行モードを初期化して最初の画面を表示する
 */
function initPreviewQuiz() {
  previewQuizState = {
    currentIndex: 0,
    answers: {},
    score: 0,
    answered: false,
    submitted: false
  };

  const displayType = (quizData.meta && quizData.meta.displayType) || 'sequential';

  if (displayType === 'list') {
    renderPreviewQuizList();
  } else {
    renderPreviewQuizSequential();
  }
}

// =====================================
// 📖 1問ずつ表示モード
// =====================================

/**
 * 1問ずつ表示モードの問題画面を描画する
 */
function renderPreviewQuizSequential() {
  const area = document.getElementById('preview-area');
  if (!area) return;

  const q = quizData.questions[previewQuizState.currentIndex];
  const total = quizData.questions.length;
  const progressPct = Math.round(((previewQuizState.currentIndex + 1) / total) * 100);
  const userAnswer = previewQuizState.answers[q.id];

  let html = `
    <div class="pb-toolbar">
      <span class="pb-mode-label">▶️ クイズ実行</span>
      <button class="pb-btn pb-btn-secondary" onclick="previewMode='list'; renderPreviewList();">📋 一覧へ</button>
    </div>

    <div class="pb-quiz-progress">
      <div class="pb-quiz-progress-text">問題 ${previewQuizState.currentIndex + 1} / ${total}</div>
      <div class="pb-quiz-progress-bar"><div class="pb-quiz-progress-fill" style="width:${progressPct}%"></div></div>
    </div>

    <div class="pb-quiz-card">
      <div class="pb-quiz-question">${q.question}</div>
  `;

  // 問題画像
  if (q.image) {
    html += `<img src="${q.image}" alt="問題画像" class="pb-quiz-image">`;
  }

  // --- 選択肢 / テキスト入力 ---
  if (q.type === 'choice') {
    html += `<div class="pb-quiz-choices">`;
    q.choices.forEach((c, ci) => {
      let btnClass = 'pb-quiz-choice';
      if (previewQuizState.answered) {
        if (ci === parseInt(q.answer)) btnClass += ' pb-quiz-choice-correct';
        else if (ci === userAnswer) btnClass += ' pb-quiz-choice-incorrect';
      } else if (ci === userAnswer) {
        btnClass += ' pb-quiz-choice-selected';
      }
      html += `<button class="${btnClass}" onclick="previewSelectChoice('${q.id}', ${ci})" ${previewQuizState.answered ? 'disabled' : ''}>`;
      if (q.choiceImages && q.choiceImages[ci]) {
        html += `<img src="${q.choiceImages[ci]}" alt="${c}" class="pb-quiz-choice-img">`;
      }
      html += `<span>${c}</span></button>`;
    });
    html += `</div>`;
  } else {
    html += `<input type="text" class="pb-quiz-text-input" id="pb-text-input"
               value="${userAnswer || ''}"
               placeholder="答えを入力してください"
               ${previewQuizState.answered ? 'disabled' : ''}
               oninput="previewQuizState.answers['${q.id}']=this.value">`;
  }

  // --- ボタン ---
  html += `<div class="pb-quiz-buttons">`;
  if (!previewQuizState.answered) {
    html += `<button class="pb-btn pb-btn-primary" onclick="previewAnswerSequential()">回答する</button>`;
  } else {
    if (previewQuizState.currentIndex < total - 1) {
      html += `<button class="pb-btn pb-btn-success" onclick="previewNextQuestion()">次の問題 →</button>`;
    } else {
      html += `<button class="pb-btn pb-btn-success" onclick="previewShowResult()">結果を見る</button>`;
    }
  }
  html += `</div>`;

  // --- フィードバック ---
  if (previewQuizState.answered) {
    const correct = previewCheckAnswer(q);
    html += `<div class="pb-quiz-feedback ${correct ? 'pb-feedback-correct' : 'pb-feedback-incorrect'}">
               ${correct ? '✓ 正解です！' : '✗ 不正解です'}
             </div>`;
    if (!correct) {
      // 正解表示
      const ans = q.type === 'choice'
        ? q.choices[parseInt(q.answer)]
        : (Array.isArray(q.answer) ? q.answer.join(' / ') : q.answer);
      html += `<div class="pb-quiz-feedback" style="background:#f0f0f0;color:#555;border-color:#ccc;"><strong>正解:</strong> ${ans}</div>`;
    }
    if (q.explanation) {
      html += `<div class="pb-quiz-feedback" style="background:#fff8e1;color:#856404;border-color:#ffe082;">💡 ${q.explanation}</div>`;
    }
  }

  html += `</div>`;
  area.innerHTML = html;
}

// =====================================
// 📋 一覧表示モード（テスト形式）
// =====================================

/**
 * 全問題を一覧で表示し、採点ボタンを表示する
 */
function renderPreviewQuizList() {
  const area = document.getElementById('preview-area');
  if (!area) return;

  // 採点済みの場合は結果画面へ
  if (previewQuizState.submitted) {
    previewShowListResult();
    return;
  }

  let html = `
    <div class="pb-toolbar">
      <span class="pb-mode-label">📋 テスト形式</span>
      <button class="pb-btn pb-btn-secondary" onclick="previewMode='list'; renderPreviewList();">📋 一覧へ</button>
    </div>
    <div class="pb-quiz-list-header">全 ${quizData.questions.length} 問</div>
  `;

  quizData.questions.forEach((q, i) => {
    const userAnswer = previewQuizState.answers[q.id];

    html += `<div class="pb-quiz-card">`;
    html += `  <div class="pb-quiz-list-num">問題 ${i + 1}</div>`;
    html += `  <div class="pb-quiz-question">${q.question}</div>`;

    if (q.image) {
      html += `<img src="${q.image}" alt="問題画像" class="pb-quiz-image">`;
    }

    if (q.type === 'choice') {
      html += `<div class="pb-quiz-choices">`;
      q.choices.forEach((c, ci) => {
        const isSelected = ci === userAnswer;
        html += `<button class="pb-quiz-choice ${isSelected ? 'pb-quiz-choice-selected' : ''}"
                         onclick="previewSelectListChoice('${q.id}', ${ci})">`;
        if (q.choiceImages && q.choiceImages[ci]) {
          html += `<img src="${q.choiceImages[ci]}" alt="${c}" class="pb-quiz-choice-img">`;
        }
        html += `<span>${c}</span></button>`;
      });
      html += `</div>`;
    } else {
      html += `<input type="text" class="pb-quiz-text-input"
                 value="${userAnswer || ''}"
                 placeholder="答えを入力してください"
                 oninput="previewQuizState.answers['${q.id}']=this.value">`;
    }

    html += `</div>`;
  });

  html += `<div class="pb-quiz-buttons">
             <button class="pb-btn pb-btn-success" style="width:100%;" onclick="previewGradeList()">📝 採点する</button>
           </div>`;

  area.innerHTML = html;
}

// =====================================
// 🖱️ イベントハンドラー
// =====================================

/**
 * 1問ずつモード：選択肢をクリック
 */
function previewSelectChoice(questionId, choiceIndex) {
  if (previewQuizState.answered) return;
  previewQuizState.answers[questionId] = choiceIndex;
  renderPreviewQuizSequential();
}

/**
 * 一覧モード：選択肢をクリック
 */
function previewSelectListChoice(questionId, choiceIndex) {
  previewQuizState.answers[questionId] = choiceIndex;
  renderPreviewQuizList();
}

/**
 * 1問ずつモード：「回答する」ボタン
 */
function previewAnswerSequential() {
  const q = quizData.questions[previewQuizState.currentIndex];
  const ans = previewQuizState.answers[q.id];

  // 未回答チェック
  if (ans === undefined || ans === null || ans === '') {
    alert('回答を選択または入力してください');
    return;
  }

  previewQuizState.answered = true;
  if (previewCheckAnswer(q)) {
    previewQuizState.score++;
  }
  renderPreviewQuizSequential();
}

/**
 * 次の問題に進む
 */
function previewNextQuestion() {
  previewQuizState.currentIndex++;
  previewQuizState.answered = false;
  renderPreviewQuizSequential();
}

/**
 * 一覧モード：「採点する」ボタン
 */
function previewGradeList() {
  // 全問回答チェック
  const unanswered = quizData.questions.some(q => {
    const ans = previewQuizState.answers[q.id];
    return ans === undefined || ans === null || ans === '';
  });
  if (unanswered) {
    if (!confirm('未回答の問題があります。このまま採点しますか？')) return;
  }

  // 採点
  previewQuizState.score = 0;
  quizData.questions.forEach(q => {
    if (previewCheckAnswer(q)) {
      previewQuizState.score++;
    }
  });

  previewQuizState.submitted = true;
  previewShowListResult();
}

// =====================================
// ✅ 回答判定
// =====================================

/**
 * 1つの問題について正解かどうかを判定する
 * @param {Object} q - 問題データ
 * @returns {boolean}
 */
function previewCheckAnswer(q) {
  const userAnswer = previewQuizState.answers[q.id];

  if (q.type === 'choice') {
    return userAnswer === parseInt(q.answer);
  }

  // text型：複数正解対応
  if (userAnswer === undefined || userAnswer === null) return false;
  const userStr = String(userAnswer).trim().toLowerCase();
  if (!userStr) return false;

  // 正解リストを構築（answer, answer2, answer3 に対応）
  const correctList = [];
  if (Array.isArray(q.answer)) {
    q.answer.forEach(a => correctList.push(String(a)));
  } else {
    correctList.push(String(q.answer));
  }
  if (q.answer2) correctList.push(String(q.answer2));
  if (q.answer3) correctList.push(String(q.answer3));

  return correctList.some(a => a.trim().toLowerCase() === userStr);
}

// =====================================
// 🏁 結果画面
// =====================================

/**
 * 1問ずつモード：結果画面
 */
function previewShowResult() {
  const area = document.getElementById('preview-area');
  if (!area) return;

  const total = quizData.questions.length;
  const pct = Math.round((previewQuizState.score / total) * 100);
  const msg = pct >= 90 ? '素晴らしい！' : pct >= 70 ? 'よくできました！' : pct >= 50 ? 'もう少し頑張りましょう！' : '復習が必要です';

  area.innerHTML = `
    <div class="pb-toolbar">
      <span class="pb-mode-label">🎉 結果</span>
      <button class="pb-btn pb-btn-secondary" onclick="previewMode='list'; renderPreviewList();">📋 一覧へ</button>
    </div>
    <div class="pb-result">
      <div class="pb-result-score">${previewQuizState.score} / ${total}</div>
      <div class="pb-result-pct">${pct}%</div>
      <div class="pb-result-msg">${msg}</div>
      <button class="pb-btn pb-btn-primary" onclick="initPreviewQuiz();">もう一度挑戦</button>
    </div>
  `;
}

/**
 * 一覧モード：結果画面（各問題の正誤も表示）
 */
function previewShowListResult() {
  const area = document.getElementById('preview-area');
  if (!area) return;

  const total = quizData.questions.length;
  const pct = Math.round((previewQuizState.score / total) * 100);
  const msg = pct >= 90 ? '素晴らしい！' : pct >= 70 ? 'よくできました！' : pct >= 50 ? 'もう少し頑張りましょう！' : '復習が必要です';

  let html = `
    <div class="pb-toolbar">
      <span class="pb-mode-label">🎉 結果</span>
      <button class="pb-btn pb-btn-secondary" onclick="previewMode='list'; renderPreviewList();">📋 一覧へ</button>
    </div>
    <div class="pb-result">
      <div class="pb-result-score">${previewQuizState.score} / ${total}</div>
      <div class="pb-result-pct">${pct}%</div>
      <div class="pb-result-msg">${msg}</div>
      <button class="pb-btn pb-btn-primary" onclick="initPreviewQuiz();">もう一度挑戦</button>
    </div>
    <div style="margin-top:20px;">
      <div class="pb-list-header" style="margin-bottom:12px;"><strong>📋 解答一覧</strong></div>
  `;

  quizData.questions.forEach((q, i) => {
    const correct = previewCheckAnswer(q);
    const userAnswer = previewQuizState.answers[q.id];

    // 正解テキスト
    let correctText = '';
    if (q.type === 'choice') {
      correctText = q.choices[parseInt(q.answer)];
    } else {
      const list = Array.isArray(q.answer) ? [...q.answer] : [q.answer];
      if (q.answer2) list.push(q.answer2);
      if (q.answer3) list.push(q.answer3);
      correctText = list.join(' / ');
    }

    // ユーザー回答テキスト
    let userText = '(未回答)';
    if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
      userText = q.type === 'choice' ? q.choices[userAnswer] : String(userAnswer);
    }

    html += `
      <div class="pb-list-item" style="border-left-color:${correct ? '#27ae60' : '#e74c3c'};">
        <div class="pb-list-header">
          <span class="pb-list-num">問題 ${i + 1}</span>
          <span style="font-weight:bold;color:${correct ? '#27ae60' : '#e74c3c'};">${correct ? '✓ 正解' : '✗ 不正解'}</span>
        </div>
        <div class="pb-list-question">${q.question}</div>
        <div class="pb-result-detail">
          <div class="pb-result-detail-row pb-result-user" style="background:${correct ? '#d5f4e6' : '#fadbd8'};">
            <strong>あなたの回答:</strong> ${userText}
          </div>
          <div class="pb-result-detail-row pb-result-correct">
            <strong>正解:</strong> ${correctText}
          </div>
        </div>
        ${q.explanation ? `<div class="pb-list-explanation">💡 ${q.explanation}</div>` : ''}
      </div>
    `;
  });

  html += `</div>`;
  area.innerHTML = html;
}

// =====================================
// 🎨 CSS（<style>で動的に挿入）
// =====================================

(function injectPreviewStyles() {
  const css = `
    /* ---- ツールバー ---- */
    .pb-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e0e0e0;
    }
    .pb-mode-label {
      font-weight: 600;
      font-size: 15px;
      color: #2c3e50;
    }
    .pb-toolbar-buttons {
      display: flex;
      gap: 6px;
    }

    /* ---- ボタン ---- */
    .pb-btn {
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 600;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .pb-btn-primary   { background: #3498db; color: #fff; }
    .pb-btn-primary:hover   { background: #2980b9; }
    .pb-btn-success   { background: #27ae60; color: #fff; }
    .pb-btn-success:hover   { background: #229954; }
    .pb-btn-secondary { background: #95a5a6; color: #fff; }
    .pb-btn-secondary:hover { background: #7f8c8d; }

    /* ---- 問題一覧アイテム ---- */
    .pb-list-item {
      background: #f8f9fa;
      border-left: 4px solid #3498db;
      border-radius: 6px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .pb-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .pb-list-num {
      font-weight: 600;
      color: #3498db;
      font-size: 13px;
    }
    .pb-type-badge {
      padding: 2px 10px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
    }
    .pb-type-choice { background: #e8f4f8; color: #2980b9; }
    .pb-type-text   { background: #fef5e7; color: #d68910; }

    .pb-list-question {
      font-size: 15px;
      font-weight: 500;
      color: #2c3e50;
      margin-bottom: 10px;
      line-height: 1.5;
    }
    .pb-list-image {
      display: block;
      max-width: 100%;
      max-height: 180px;
      border-radius: 6px;
      margin-bottom: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .pb-list-choices { display: flex; flex-direction: column; gap: 5px; }
    .pb-list-choice {
      padding: 7px 10px;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pb-list-choice-correct {
      background: #d5f4e6;
      border-color: #27ae60;
      font-weight: 500;
    }
    .pb-list-choice-img {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .pb-list-answer {
      margin-top: 8px;
      padding: 8px 10px;
      background: #d5f4e6;
      border-radius: 4px;
      font-size: 13px;
    }
    .pb-list-explanation {
      margin-top: 8px;
      padding: 8px 10px;
      background: #fff3cd;
      border-radius: 4px;
      font-size: 12px;
      color: #856404;
    }

    /* ---- クイズ実行：プログレス ---- */
    .pb-quiz-progress {
      margin-bottom: 16px;
    }
    .pb-quiz-progress-text {
      font-size: 13px;
      font-weight: 600;
      color: #3498db;
      margin-bottom: 6px;
    }
    .pb-quiz-progress-bar {
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
    }
    .pb-quiz-progress-fill {
      height: 100%;
      background: #3498db;
      transition: width 0.3s;
    }

    /* ---- クイズ実行：問題カード ---- */
    .pb-quiz-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 18px;
      margin-bottom: 14px;
    }
    .pb-quiz-list-num {
      display: inline-block;
      background: #3498db;
      color: #fff;
      padding: 3px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .pb-quiz-list-header {
      font-size: 14px;
      font-weight: 600;
      color: #7f8c8d;
      margin-bottom: 12px;
    }
    .pb-quiz-question {
      font-size: 17px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 16px;
      line-height: 1.5;
    }
    .pb-quiz-image {
      display: block;
      max-width: 100%;
      max-height: 200px;
      border-radius: 6px;
      margin-bottom: 14px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }

    /* ---- クイズ実行：選択肢 ---- */
    .pb-quiz-choices { display: flex; flex-direction: column; gap: 8px; }
    .pb-quiz-choice {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: #fff;
      border: 2px solid #ddd;
      border-radius: 7px;
      font-size: 14px;
      text-align: left;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }
    .pb-quiz-choice:hover:not(:disabled) {
      border-color: #3498db;
      background: #f0f8ff;
    }
    .pb-quiz-choice:disabled { cursor: default; }
    .pb-quiz-choice-selected  { border-color: #3498db; background: #e8f4f8; }
    .pb-quiz-choice-correct   { border-color: #27ae60; background: #d5f4e6; }
    .pb-quiz-choice-incorrect { border-color: #e74c3c; background: #fadbd8; }
    .pb-quiz-choice-img {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 5px;
      flex-shrink: 0;
    }

    /* ---- クイズ実行：テキスト入力 ---- */
    .pb-quiz-text-input {
      width: 100%;
      padding: 12px;
      font-size: 15px;
      border: 2px solid #ddd;
      border-radius: 7px;
      outline: none;
      transition: border-color 0.2s;
    }
    .pb-quiz-text-input:focus { border-color: #3498db; }
    .pb-quiz-text-input:disabled { background: #ecf0f1; cursor: not-allowed; }

    /* ---- クイズ実行：ボタン行 ---- */
    .pb-quiz-buttons {
      display: flex;
      gap: 8px;
      margin-top: 18px;
    }
    .pb-quiz-buttons .pb-btn { flex: 1; padding: 10px; font-size: 14px; }

    /* ---- クイズ実行：フィードバック ---- */
    .pb-quiz-feedback {
      margin-top: 10px;
      padding: 12px 14px;
      border-radius: 6px;
      font-size: 14px;
      border: 2px solid transparent;
    }
    .pb-feedback-correct  { background: #d5f4e6; border-color: #27ae60; color: #27ae60; font-weight: 600; }
    .pb-feedback-incorrect { background: #fadbd8; border-color: #e74c3c; color: #c0392b; font-weight: 600; }

    /* ---- 結果画面 ---- */
    .pb-result {
      text-align: center;
      padding: 28px 10px;
    }
    .pb-result-score {
      font-size: 36px;
      font-weight: bold;
      color: #3498db;
      margin-bottom: 4px;
    }
    .pb-result-pct {
      font-size: 22px;
      color: #7f8c8d;
      margin-bottom: 8px;
    }
    .pb-result-msg {
      font-size: 16px;
      color: #2c3e50;
      margin-bottom: 18px;
    }

    /* ---- 解答一覧（結果画面） ---- */
    .pb-result-detail { margin-top: 10px; display: flex; flex-direction: column; gap: 4px; }
    .pb-result-detail-row {
      padding: 7px 10px;
      border-radius: 4px;
      font-size: 13px;
    }
    .pb-result-correct { background: #d5f4e6; }
  `;

  const style = document.createElement('style');
  style.id = 'preview-builder-styles';
  style.textContent = css;
  document.head.appendChild(style);
})();

// =====================================
// 🔍 グローバル公開
// =====================================
if (typeof window !== 'undefined') {
  window.togglePreviewMode          = togglePreviewMode;
  window.renderPreviewList          = renderPreviewList;
  window.initPreviewQuiz            = initPreviewQuiz;
  window.renderPreviewQuizSequential = renderPreviewQuizSequential;
  window.renderPreviewQuizList      = renderPreviewQuizList;
  window.previewSelectChoice        = previewSelectChoice;
  window.previewSelectListChoice    = previewSelectListChoice;
  window.previewAnswerSequential    = previewAnswerSequential;
  window.previewNextQuestion        = previewNextQuestion;
  window.previewGradeList           = previewGradeList;
  window.previewShowResult          = previewShowResult;
  window.previewShowListResult      = previewShowListResult;
  window.previewCheckAnswer         = previewCheckAnswer;
  console.log('✅ preview-builder.js loaded');
}