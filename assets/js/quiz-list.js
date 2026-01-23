/**
 * quiz-list.js
 * 
 * 全問題を一覧表示し、採点ボタンで一括判定するクイズ
 */

// =====================================
// 📦 グローバル変数
// =====================================

/**
 * ユーザーの回答を保存
 * { questionIndex: userAnswer }
 */
let userAnswers = {};

/**
 * 採点済みかどうか
 */
let isGraded = false;

// =====================================
// 🎨 HTML生成関数
// =====================================

/**
 * クイズ全体のHTMLを生成（一覧表示型）
 * 
 * @returns {string} HTML文字列
 */
function generateQuizListHTML() {
  console.log('🎨 一覧表示型クイズHTML生成');
  
  if (!quizData || !quizData.questions) {
    return '<p>⚠️ クイズデータが読み込まれていません</p>';
  }
  
  const title = quizData.meta.title || 'クイズ';
  const totalQuestions = quizData.questions.length;
  
  let html = `
    <div class="quiz-app">
      <!-- ヘッダー -->
      <div class="quiz-header">
        <h1>${title}</h1>
        <p class="quiz-info">全${totalQuestions}問</p>
      </div>
      
      <!-- 問題リスト -->
      <div class="quiz-questions">
  `;
  
  // 各問題を表示
  quizData.questions.forEach((q, index) => {
    html += renderQuestionItem(q, index);
  });
  
  html += `
      </div>
      
      <!-- 採点ボタン -->
      <div class="quiz-actions">
        <button class="btn-grade" onclick="gradeQuiz()">
          📝 採点する
        </button>
      </div>
      
      <!-- 結果表示エリア -->
      <div id="result-area" class="result-area" style="display: none;"></div>
    </div>
  `;
  
  return html;
}

/**
 * 1問分のHTMLを生成
 * 
 * @param {Object} question - 問題データ
 * @param {number} index - 問題番号
 * @returns {string} HTML文字列
 */
function renderQuestionItem(question, index) {
  const questionNumber = index + 1;
  
  let html = `
    <div class="question-item" id="question-${index}" data-index="${index}">
      <div class="question-header">
        <span class="question-number">問題 ${questionNumber}/${quizData.questions.length}</span>
        <span class="question-status" id="status-${index}"></span>
      </div>
      
      <div class="question-text">${question.question}</div>
      
      <div class="question-answer">
  `;
  
  if (question.type === 'choice') {
    // 4択クイズ
    html += '<div class="choices-list">';
    question.choices.forEach((choice, i) => {
      html += `
        <label class="choice-label" id="choice-${index}-${i}">
          <input 
            type="radio" 
            name="answer-${index}" 
            value="${i}"
            onchange="saveAnswer(${index}, ${i})">
          <span class="choice-text">${choice}</span>
        </label>
      `;
    });
    html += '</div>';
  } else {
    // テキスト入力
    html += `
      <input 
        type="text" 
        class="text-answer-input" 
        id="text-answer-${index}"
        placeholder="答えを入力してください"
        onchange="saveTextAnswer(${index})">
    `;
  }
  
  html += `
      </div>
      
      <!-- 解説エリア（採点後に表示） -->
      <div class="explanation-area" id="explanation-${index}" style="display: none;">
        <button class="explanation-toggle" onclick="toggleExplanation(${index})">
          <span class="toggle-icon" id="toggle-icon-${index}">▶</span>
          解説を見る
        </button>
        <div class="explanation-content" id="explanation-content-${index}" style="display: none;">
          ${question.explanation || '解説はありません'}
        </div>
      </div>
    </div>
  `;
  
  return html;
}

// =====================================
// 💾 回答の保存
// =====================================

/**
 * choice型の回答を保存
 * 
 * @param {number} questionIndex - 問題のインデックス
 * @param {number} choiceIndex - 選択肢のインデックス
 */
function saveAnswer(questionIndex, choiceIndex) {
  console.log(`💾 回答保存: 問題${questionIndex + 1} → 選択肢${choiceIndex + 1}`);
  userAnswers[questionIndex] = choiceIndex;
}

/**
 * text型の回答を保存
 * 
 * @param {number} questionIndex - 問題のインデックス
 */
function saveTextAnswer(questionIndex) {
  const input = document.getElementById(`text-answer-${questionIndex}`);
  const answer = input.value.trim();
  console.log(`💾 回答保存: 問題${questionIndex + 1} → "${answer}"`);
  userAnswers[questionIndex] = answer;
}

// =====================================
// 📝 採点処理
// =====================================

/**
 * クイズを採点
 */
async function gradeQuiz() {
  console.log('📝 採点開始');
  
  // 全問回答済みかチェック
  const totalQuestions = quizData.questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  
  if (answeredCount < totalQuestions) {
    const unansweredCount = totalQuestions - answeredCount;
    if (!confirm(`⚠️ ${unansweredCount}問未回答です。\n\nこのまま採点しますか？`)) {
      return;
    }
  }
  
  // 採点ボタンを無効化
  const gradeButton = document.querySelector('.btn-grade');
  gradeButton.disabled = true;
  gradeButton.textContent = '採点中...';
  
  // 1問目までスクロール
  const firstQuestion = document.getElementById('question-0');
  if (firstQuestion) {
    firstQuestion.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // スクロール完了を待つ
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  let correctCount = 0;
  
  // 各問題を順番に判定
  for (let index = 0; index < quizData.questions.length; index++) {
    const q = quizData.questions[index];
    const userAnswer = userAnswers[index];
    let isCorrect = false;
    
    if (q.type === 'choice') {
      // choice型の判定
      isCorrect = (userAnswer === q.answer);
    } else {
      // text型の判定
      if (userAnswer) {
        isCorrect = userAnswer.toLowerCase() === q.answer.toLowerCase();
      }
    }
    
    if (isCorrect) {
      correctCount++;
    }
    
    // 正誤を表示
    displayResult(index, isCorrect, q);
    
    // 次の問題までスクロール（最後の問題以外）
    if (index < quizData.questions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const nextQuestion = document.getElementById(`question-${index + 1}`);
      if (nextQuestion) {
        nextQuestion.scrollIntoView({ behavior: 'smooth', block: 'start' });
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }
  }
  
  // 結果サマリーを表示
  displaySummary(correctCount, totalQuestions);
  
  // 採点ボタンのテキスト更新
  gradeButton.textContent = '✅ 採点済み';
  
  // 解説エリアを表示
  document.querySelectorAll('.explanation-area').forEach(el => {
    el.style.display = 'block';
  });
  
  isGraded = true;
  
  console.log(`✅ 採点完了: ${correctCount}/${totalQuestions}問正解`);
}

/**
 * 個別の問題の正誤を表示
 * 
 * @param {number} index - 問題のインデックス
 * @param {boolean} isCorrect - 正解かどうか
 * @param {Object} question - 問題データ
 */
function displayResult(index, isCorrect, question) {
  const statusElement = document.getElementById(`status-${index}`);
  const questionItem = document.getElementById(`question-${index}`);
  
  // 吹き出しマークを表示
  const bubble = isCorrect ? '💬⭕' : '💬❌';
  statusElement.innerHTML = `<span class="status-bubble ${isCorrect ? 'bubble-correct' : 'bubble-incorrect'}">${bubble}</span>`;
  
  if (isCorrect) {
    // 正解
    questionItem.classList.add('correct');
    
    // 正解の選択肢を強調（choice型の場合）
    if (question.type === 'choice') {
      const userAnswer = userAnswers[index];
      if (userAnswer !== undefined) {
        const choiceLabel = document.getElementById(`choice-${index}-${userAnswer}`);
        if (choiceLabel) {
          choiceLabel.classList.add('choice-correct');
          // 選択肢の横に小さな吹き出し
          const choiceBubble = document.createElement('span');
          choiceBubble.className = 'choice-bubble bubble-correct';
          choiceBubble.textContent = '⭕';
          choiceLabel.appendChild(choiceBubble);
        }
      }
    } else {
      // text型の場合、入力欄を緑に
      const input = document.getElementById(`text-answer-${index}`);
      if (input) {
        input.classList.add('input-correct');
        // 入力欄の横に小さな吹き出し
        const inputBubble = document.createElement('span');
        inputBubble.className = 'input-bubble bubble-correct';
        inputBubble.textContent = '⭕';
        input.parentNode.appendChild(inputBubble);
      }
    }
  } else {
    // 不正解
    questionItem.classList.add('incorrect');
    
    if (question.type === 'choice') {
      // ユーザーの回答に×マーク
      const userAnswer = userAnswers[index];
      if (userAnswer !== undefined) {
        const choiceLabel = document.getElementById(`choice-${index}-${userAnswer}`);
        if (choiceLabel) {
          choiceLabel.classList.add('choice-incorrect');
          const choiceBubble = document.createElement('span');
          choiceBubble.className = 'choice-bubble bubble-incorrect';
          choiceBubble.textContent = '❌';
          choiceLabel.appendChild(choiceBubble);
        }
      }
      
      // 正解に◯マーク
      const correctChoice = document.getElementById(`choice-${index}-${question.answer}`);
      if (correctChoice) {
        correctChoice.classList.add('choice-correct');
        const correctBubble = document.createElement('span');
        correctBubble.className = 'choice-bubble bubble-correct';
        correctBubble.textContent = '⭕';
        correctChoice.appendChild(correctBubble);
      }
    } else {
      // text型の場合
      const input = document.getElementById(`text-answer-${index}`);
      if (input) {
        input.classList.add('input-incorrect');
        const inputBubble = document.createElement('span');
        inputBubble.className = 'input-bubble bubble-incorrect';
        inputBubble.textContent = '❌';
        input.parentNode.appendChild(inputBubble);
        
        // 正解を表示
        const correctAnswerSpan = document.createElement('span');
        correctAnswerSpan.className = 'correct-answer-text';
        correctAnswerSpan.textContent = `正解: ${question.answer}`;
        input.parentNode.appendChild(correctAnswerSpan);
      }
    }
  }
  
  // 入力を無効化
  questionItem.querySelectorAll('input').forEach(input => {
    input.disabled = true;
  });
}

/**
 * 結果サマリーを表示
 * 
 * @param {number} correctCount - 正解数
 * @param {number} totalQuestions - 総問題数
 */
function displaySummary(correctCount, totalQuestions) {
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  
  let message = '';
  if (percentage === 100) {
    message = '🎉 完璧です！全問正解おめでとうございます！';
  } else if (percentage >= 80) {
    message = '👏 素晴らしい！よくできました！';
  } else if (percentage >= 60) {
    message = '👍 よくできました！';
  } else {
    message = '💪 もう一度チャレンジしてみましょう！';
  }
  
  const resultArea = document.getElementById('result-area');
  resultArea.innerHTML = `
    <div class="result-summary">
      <h2>採点結果</h2>
      <div class="result-score">
        <span class="score-number">${correctCount}</span>
        <span class="score-separator">/</span>
        <span class="score-total">${totalQuestions}</span>
        <span class="score-unit">問正解</span>
      </div>
      <div class="result-percentage">${percentage}%</div>
      <p class="result-message">${message}</p>
    </div>
  `;
  resultArea.style.display = 'block';
  
  // 結果までスクロール
  resultArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// =====================================
// 📖 解説の折り畳み
// =====================================

/**
 * 解説の表示/非表示を切り替え
 * 
 * @param {number} index - 問題のインデックス
 */
function toggleExplanation(index) {
  const content = document.getElementById(`explanation-content-${index}`);
  const icon = document.getElementById(`toggle-icon-${index}`);
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.textContent = '▼';
  } else {
    content.style.display = 'none';
    icon.textContent = '▶';
  }
}

// =====================================
// 🎬 初期化
// =====================================

/**
 * クイズを初期化
 */
function initQuizList() {
  console.log('🎬 一覧表示型クイズを初期化');
  
  // 変数をリセット
  userAnswers = {};
  isGraded = false;
  
  // HTMLを生成して表示
  const appElement = document.getElementById('app') || document.getElementById('quiz-app-root');
  if (appElement) {
    appElement.innerHTML = generateQuizListHTML();
  }
  
  console.log('✅ 一覧表示型クイズ初期化完了');
}

// =====================================
// 🔍 デバッグ用
// =====================================

if (typeof window !== 'undefined') {
  window.generateQuizListHTML = generateQuizListHTML;
  window.saveAnswer = saveAnswer;
  window.saveTextAnswer = saveTextAnswer;
  window.gradeQuiz = gradeQuiz;
  window.toggleExplanation = toggleExplanation;
  window.initQuizList = initQuizList;
  console.log('✅ quiz-list.js loaded');
}