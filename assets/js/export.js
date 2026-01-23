/**
 * export.js
 * 
 * WordPress用のファイルを書き出すための処理
 * HTML、CSS、JSを生成してダウンロードします
 */

// =====================================
// 📄 HTML生成 (1問ずつ型)
// =====================================

/**
 * WordPress用の完全なHTML文字列を生成
 * 
 * このHTMLには以下が含まれます:
 * - クイズのHTML構造
 * - quizDataの埋め込み
 * - preview.jsの全ロジック
 * - 初期化コード
 * 
 * @returns {string} 完全なHTML文字列
 */
function generateWordPressHTML() {
  console.log('📝 WordPress用HTML生成開始');
  
  // preview.jsの中身を取得(関数定義部分)
  const previewJsCode = getPreviewJsCode();
  
  // quizDataをJSON文字列に変換
  const quizDataString = JSON.stringify(quizData, null, 2);
  
  // 完全なHTMLを生成
  const html = `<!-- クイズアプリ -->
<div id="quiz-app-root">
  <div class="loading">読み込み中...</div>
</div>

<script>
// =====================================
// クイズデータ
// =====================================
const quizData = ${quizDataString};

// =====================================
// クイズ制御ロジック
// =====================================
${previewJsCode}

// =====================================
// 初期化
// =====================================
document.addEventListener('DOMContentLoaded', function() {
  const rootElement = document.getElementById('quiz-app-root');
  if (rootElement) {
    rootElement.innerHTML = generateQuizHTML();
    showCurrentQuestion();
  }
});
</script>

<style>
/* このスタイルは quiz.css の内容をここに貼り付けてください */
/* または、WordPress側でquiz.cssを読み込むように設定してください */
</style>`;
  
  console.log('✅ HTML生成完了');
  return html;
}

/**
 * preview.jsのコードを文字列として取得
 * 
 * @returns {string} JavaScriptコード
 */
function getPreviewJsCode() {
  const code = `
// グローバル変数
let currentQuestionIndex = 0;
let score = 0;

// クイズ全体のHTML生成
function generateQuizHTML() {
  if (!quizData || !quizData.questions) {
    return '<p>⚠️ クイズデータが読み込まれていません</p>';
  }
  const title = quizData.meta.title || 'クイズ';
  return \`
    <div class="quiz-app">
      <div class="quiz-header">
        <h1>\${title}</h1>
        <p class="quiz-progress">問題 <span id="current-question">1</span> / \${quizData.questions.length}</p>
      </div>
      <div class="quiz-body" id="quiz-body">
        ここに問題が表示されます
      </div>
    </div>
  \`;
}

// choice型問題の描画
function renderChoiceQuestion(questionData, questionIndex) {
  const questionText = questionData.question;
  let choicesHTML = '';
  questionData.choices.forEach((choice, index) => {
    choicesHTML += \`
      <button class="choice-button" onclick="handleChoiceClick(\${questionIndex}, \${index})" data-index="\${index}">
        \${choice}
      </button>
    \`;
  });
  return \`
    <div class="question-container" data-question-id="\${questionData.id}">
      <h2 class="question-text">\${questionText}</h2>
      <div class="choices-container">\${choicesHTML}</div>
      <div class="feedback" id="feedback"></div>
    </div>
  \`;
}

// text型問題の描画
function renderTextQuestion(questionData, questionIndex) {
  const questionText = questionData.question;
  return \`
    <div class="question-container" data-question-id="\${questionData.id}">
      <h2 class="question-text">\${questionText}</h2>
      <div class="text-answer-container">
        <input type="text" class="text-input" id="text-input-\${questionIndex}" placeholder="答えを入力してください" autocomplete="off">
        <button class="submit-button" onclick="handleTextSubmit(\${questionIndex})">回答する</button>
      </div>
      <div class="feedback" id="feedback"></div>
    </div>
  \`;
}

// 問題タイプ別振り分け
function renderQuestion(questionData, questionIndex) {
  switch (questionData.type) {
    case 'choice': return renderChoiceQuestion(questionData, questionIndex);
    case 'text': return renderTextQuestion(questionData, questionIndex);
    default: return '<p class="error">⚠️ 未対応の問題形式です</p>';
  }
}

// choice型の回答判定
function handleChoiceClick(questionIndex, selectedIndex) {
  const questionData = quizData.questions[questionIndex];
  const correctIndex = questionData.answer;
  const isCorrect = (selectedIndex === correctIndex);
  const feedbackElement = document.getElementById('feedback');
  
  if (isCorrect) {
    score++;
    let feedbackHTML = '🎉 正解!';
    if (questionData.explanation) {
      feedbackHTML += '<div class="explanation">' + questionData.explanation + '</div>';
    }
    feedbackElement.innerHTML = feedbackHTML;
    feedbackElement.className = 'feedback show correct';
  } else {
    const correctAnswer = questionData.choices[correctIndex];
    let feedbackHTML = '❌ 不正解。正解は「' + correctAnswer + '」です。';
    if (questionData.explanation) {
      feedbackHTML += '<div class="explanation">' + questionData.explanation + '</div>';
    }
    feedbackElement.innerHTML = feedbackHTML;
    feedbackElement.className = 'feedback show incorrect';
  }
  
  const buttons = document.querySelectorAll('.choice-button');
  buttons.forEach(button => {
    button.disabled = true;
    button.style.cursor = 'not-allowed';
    button.style.opacity = '0.6';
  });
  
  const clickedButton = document.querySelector('.choice-button[data-index="' + selectedIndex + '"]');
  if (isCorrect) {
    clickedButton.style.backgroundColor = '#27ae60';
    clickedButton.style.color = 'white';
    clickedButton.style.borderColor = '#27ae60';
  } else {
    clickedButton.style.backgroundColor = '#e74c3c';
    clickedButton.style.color = 'white';
    clickedButton.style.borderColor = '#e74c3c';
    const correctButton = document.querySelector('.choice-button[data-index="' + correctIndex + '"]');
    correctButton.style.backgroundColor = '#27ae60';
    correctButton.style.color = 'white';
    correctButton.style.borderColor = '#27ae60';
  }
  
  showNextButton();
}

// export.js の getPreviewJsCode() 関数内の
// handleTextSubmit 関数を以下で置き換えてください

// text型の回答判定
function handleTextSubmit(questionIndex) {
  const questionData = quizData.questions[questionIndex];
  const inputElement = document.getElementById('text-input-' + questionIndex);
  const userAnswer = inputElement.value;
  
  if (userAnswer.trim() === '') {
    alert('答えを入力してください');
    return;
  }
  
  // 複数正解に対応した判定
  let isCorrect = false;
  let correctAnswerText = '';
  
  if (Array.isArray(questionData.answer)) {
    // 複数正解の場合
    correctAnswerText = questionData.answer[0];
    isCorrect = questionData.answer.some(function(ans) {
      return userAnswer.trim().toLowerCase() === ans.toLowerCase();
    });
  } else {
    // 単一正解の場合
    correctAnswerText = questionData.answer;
    isCorrect = userAnswer.trim().toLowerCase() === correctAnswerText.toLowerCase();
  }
  
  const feedbackElement = document.getElementById('feedback');
  
  if (isCorrect) {
    score++;
    let feedbackHTML = '🎉 正解!';
    if (questionData.explanation) {
      feedbackHTML += '<div class="explanation">' + questionData.explanation + '</div>';
    }
    feedbackElement.innerHTML = feedbackHTML;
    feedbackElement.className = 'feedback show correct';
    inputElement.style.borderColor = '#27ae60';
    inputElement.style.backgroundColor = '#d4edda';
  } else {
    let feedbackHTML = '❌ 不正解。正解は「' + correctAnswerText + '」です。';
    
    // 複数正解がある場合は他の正解も表示
    if (Array.isArray(questionData.answer) && questionData.answer.length > 1) {
      feedbackHTML += '<br><small>他の正解: ' + questionData.answer.slice(1).join(', ') + '</small>';
    }
    
    if (questionData.explanation) {
      feedbackHTML += '<div class="explanation">' + questionData.explanation + '</div>';
    }
    feedbackElement.innerHTML = feedbackHTML;
    feedbackElement.className = 'feedback show incorrect';
    inputElement.style.borderColor = '#e74c3c';
    inputElement.style.backgroundColor = '#f8d7da';
  }
  
  inputElement.disabled = true;
  const submitButton = document.querySelector('.submit-button');
  submitButton.disabled = true;
  submitButton.style.cursor = 'not-allowed';
  submitButton.style.opacity = '0.6';
  
  showNextButton();
}

// 次へボタンを表示
function showNextButton() {
  if (document.getElementById('next-button')) return;
  const feedbackElement = document.getElementById('feedback');
  const nextButton = document.createElement('button');
  nextButton.id = 'next-button';
  nextButton.className = 'next-button';
  nextButton.textContent = '次へ ➡️';
  nextButton.onclick = nextQuestion;
  feedbackElement.appendChild(nextButton);
}

// 現在の問題を表示
function showCurrentQuestion() {
  const questionData = quizData.questions[currentQuestionIndex];
  const questionHTML = renderQuestion(questionData, currentQuestionIndex);
  const quizBody = document.getElementById('quiz-body');
  quizBody.innerHTML = questionHTML;
  updateProgress();
}

// 進行状況を更新
function updateProgress() {
  const currentQuestionElement = document.getElementById('current-question');
  if (currentQuestionElement) {
    currentQuestionElement.textContent = currentQuestionIndex + 1;
  }
}

// 次の問題へ
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < quizData.questions.length) {
    showCurrentQuestion();
  } else {
    showResult();
  }
}

// 結果画面を表示
function showResult() {
  const totalQuestions = quizData.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  let message = '';
  if (percentage === 100) message = '🎉 完璧です!';
  else if (percentage >= 80) message = '👏 素晴らしい!';
  else if (percentage >= 60) message = '👍 よくできました!';
  else message = '💪 もう一度挑戦してみましょう!';
  
  const resultHTML = \`
    <div class="result-container">
      <h2>クイズ終了!</h2>
      <div class="score-display">
        <p class="score-number">\${score} / \${totalQuestions}</p>
        <p class="score-percentage">(\${percentage}%)</p>
      </div>
      <p class="result-message">\${message}</p>
      <button class="restart-button" onclick="restartQuiz()">もう一度挑戦</button>
    </div>
  \`;
  const quizBody = document.getElementById('quiz-body');
  quizBody.innerHTML = resultHTML;
}

// クイズをリスタート
function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  showCurrentQuestion();
}
`;
  
  return code;
}

// =====================================
// 📄 HTML生成 (一覧表示型) 🆕
// =====================================

/**
 * 一覧表示型のJavaScriptコードを取得
 * 
 * @returns {string} JavaScriptコード
 */
function getListQuizJsCode() {
  const code = `
// グローバル変数
let userAnswers = {};
let isSubmitted = false;

// クイズ全体のHTML生成(一覧表示型)
function generateQuizHTML() {
  if (!quizData || !quizData.questions) {
    return '<p>⚠️ クイズデータが読み込まれていません</p>';
  }
  
  const title = quizData.meta.title || 'クイズ';
  let questionsHTML = '';
  
  quizData.questions.forEach((question, index) => {
    questionsHTML += renderQuestionInList(question, index);
  });
  
  return \`
    <div class="quiz-app-list">
      <div class="quiz-header-list">
        <h1>\${title}</h1>
        <p class="quiz-info">全\${quizData.questions.length}問</p>
      </div>
      <div class="quiz-body-list">
        \${questionsHTML}
      </div>
      <div class="quiz-footer-list">
        <button class="submit-all-button" onclick="submitAllAnswers()">📝 採点する</button>
      </div>
      <div class="result-area" id="result-area" style="display: none;"></div>
    </div>
  \`;
}

// choice型問題の描画(一覧表示用)
function renderChoiceQuestionInList(questionData, questionIndex) {
  const questionText = questionData.question;
  let choicesHTML = '';
  
  questionData.choices.forEach((choice, choiceIndex) => {
    const inputId = \`q\${questionIndex}-choice\${choiceIndex}\`;
    choicesHTML += \`
      <div class="choice-option">
        <input 
          type="radio" 
          name="question-\${questionIndex}" 
          id="\${inputId}" 
          value="\${choiceIndex}"
          onchange="saveAnswer('\${questionData.id}', \${choiceIndex})"
        >
        <label for="\${inputId}">\${choice}</label>
      </div>
    \`;
  });
  
  return \`
    <div class="question-item-list" data-question-id="\${questionData.id}">
      <div class="question-number">問題 \${questionIndex + 1}</div>
      <h3 class="question-text-list">\${questionText}</h3>
      <div class="choices-container-list">
        \${choicesHTML}
      </div>
      <div class="feedback-list" id="feedback-\${questionData.id}"></div>
    </div>
  \`;
}

// text型問題の描画(一覧表示用)
function renderTextQuestionInList(questionData, questionIndex) {
  const questionText = questionData.question;
  const inputId = \`q\${questionIndex}-text\`;
  
  return \`
    <div class="question-item-list" data-question-id="\${questionData.id}">
      <div class="question-number">問題 \${questionIndex + 1}</div>
      <h3 class="question-text-list">\${questionText}</h3>
      <div class="text-answer-container-list">
        <input 
          type="text" 
          class="text-input-list" 
          id="\${inputId}" 
          placeholder="答えを入力してください"
          oninput="saveAnswer('\${questionData.id}', this.value)"
          autocomplete="off"
        >
      </div>
      <div class="feedback-list" id="feedback-\${questionData.id}"></div>
    </div>
  \`;
}

// 問題タイプ別振り分け(一覧表示用)
function renderQuestionInList(questionData, questionIndex) {
  switch (questionData.type) {
    case 'choice':
      return renderChoiceQuestionInList(questionData, questionIndex);
    case 'text':
      return renderTextQuestionInList(questionData, questionIndex);
    default:
      return '<p class="error">⚠️ 未対応の問題形式です</p>';
  }
}

// 回答を保存
function saveAnswer(questionId, answer) {
  userAnswers[questionId] = answer;
}

// 全問採点
function submitAllAnswers() {
  if (isSubmitted) {
    alert('すでに採点済みです');
    return;
  }
  
  const unansweredCount = quizData.questions.length - Object.keys(userAnswers).length;
  if (unansweredCount > 0) {
    const confirmSubmit = confirm(\`未回答の問題が\${unansweredCount}問あります。\\n\\nこのまま採点しますか?\`);
    if (!confirmSubmit) return;
  }
  
  isSubmitted = true;
  let score = 0;
  
  quizData.questions.forEach((question) => {
    const userAnswer = userAnswers[question.id];
    let isCorrect = false;
    
    if (question.type === 'choice') {
      isCorrect = (userAnswer !== undefined && userAnswer === question.answer);
    } else if (question.type === 'text') {
      if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
        isCorrect = userAnswer.trim().toLowerCase() === question.answer.toLowerCase();
      }
    }
    
    if (isCorrect) score++;
    showFeedback(question, userAnswer, isCorrect);
  });
  
  showFinalResult(score);
  
  const submitButton = document.querySelector('.submit-all-button');
  submitButton.disabled = true;
  submitButton.textContent = '✅ 採点済み';
  submitButton.style.cursor = 'not-allowed';
  submitButton.style.opacity = '0.6';
  
  disableAllInputs();
}

// フィードバック表示
function showFeedback(question, userAnswer, isCorrect) {
  const feedbackElement = document.getElementById('feedback-' + question.id);
  
  if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
    feedbackElement.innerHTML = '⚠️ 未回答';
    feedbackElement.className = 'feedback-list show unanswered';
    return;
  }
  
  let feedbackHTML = '';
  
  if (isCorrect) {
    feedbackHTML = '🎉 正解!';
    feedbackElement.className = 'feedback-list show correct';
  } else {
    let correctAnswerText = '';
    if (question.type === 'choice') {
      correctAnswerText = question.choices[question.answer];
    } else {
      correctAnswerText = question.answer;
    }
    feedbackHTML = '❌ 不正解。正解は「' + correctAnswerText + '」です。';
    feedbackElement.className = 'feedback-list show incorrect';
  }
  
  if (question.explanation) {
    feedbackHTML += '<div class="explanation-list">' + question.explanation + '</div>';
  }
  
  feedbackElement.innerHTML = feedbackHTML;
}

// 最終結果表示
function showFinalResult(score) {
  const totalQuestions = quizData.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  
  let message = '';
  if (percentage === 100) message = '🎉 完璧です!';
  else if (percentage >= 80) message = '👏 素晴らしい!';
  else if (percentage >= 60) message = '👍 よくできました!';
  else message = '💪 もう一度挑戦してみましょう!';
  
  const resultHTML = \`
    <div class="result-container-list">
      <h2>📊 採点結果</h2>
      <div class="score-display-list">
        <p class="score-number-list">\${score} / \${totalQuestions}</p>
        <p class="score-percentage-list">(\${percentage}%)</p>
      </div>
      <p class="result-message-list">\${message}</p>
      <button class="restart-button-list" onclick="restartQuiz()">🔄 もう一度挑戦</button>
    </div>
  \`;
  
  const resultArea = document.getElementById('result-area');
  resultArea.innerHTML = resultHTML;
  resultArea.style.display = 'block';
  resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 全入力を無効化
function disableAllInputs() {
  document.querySelectorAll('input[type="radio"]').forEach(input => {
    input.disabled = true;
  });
  document.querySelectorAll('.text-input-list').forEach(input => {
    input.disabled = true;
  });
}

// クイズをリスタート
function restartQuiz() {
  location.reload();
}
`;
  
  return code;
}

/**
 * 一覧表示型のWordPress用HTML生成
 * 
 * @returns {string} 完全なHTML文字列
 */
function generateWordPressHTMLList() {
  console.log('📝 一覧表示型HTML生成開始');
  
  const listJsCode = getListQuizJsCode();
  const quizDataString = JSON.stringify(quizData, null, 2);
  const cssContent = getListQuizCSS();
  
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${quizData.meta.title || 'クイズ'} - 一覧表示</title>
  
  <style>
${cssContent}
  </style>
</head>
<body>
  <div id="quiz-app-root">
    <div class="loading">読み込み中...</div>
  </div>

  <script>
  const quizData = ${quizDataString};
  ${listJsCode}
  
  document.addEventListener('DOMContentLoaded', function() {
    const rootElement = document.getElementById('quiz-app-root');
    if (rootElement) {
      rootElement.innerHTML = generateQuizHTML();
    }
  });
  </script>
</body>
</html>`;
  
  console.log('✅ 一覧表示型HTML生成完了');
  return html;
}

// =====================================
// 🎨 CSS取得
// =====================================

/**
 * quiz.cssの内容を文字列として返す
 * 
 * @returns {string} CSS文字列
 */
function getQuizCSS() {
  console.log('🎨 CSS取得開始');
  
  const cssContent = `/**
 * quiz.css
 * クイズ表示用のスタイルシート
 */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f0f2f5;
  padding: 20px;
  line-height: 1.6;
}

#app, #quiz-app-root {
  max-width: 600px;
  margin: 0 auto;
}

.quiz-app {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.quiz-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.quiz-header h1 {
  color: #2c3e50;
  font-size: 28px;
  margin-bottom: 10px;
}

.quiz-progress {
  color: #7f8c8d;
  font-size: 14px;
}

.quiz-body {
  min-height: 200px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.question-container {
  padding: 20px;
}

.question-text {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 25px;
  font-weight: 600;
}

.choices-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.choice-button {
  padding: 15px 20px;
  font-size: 16px;
  background-color: #ffffff;
  border: 2px solid #3498db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.choice-button:hover {
  background-color: #3498db;
  color: white;
  transform: translateX(5px);
}

.choice-button:disabled {
  cursor: not-allowed !important;
  opacity: 0.6;
}

.choice-button:disabled:hover {
  transform: none !important;
}

.text-answer-container {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.text-input {
  flex: 1;
  padding: 12px 15px;
  font-size: 16px;
  border: 2px solid #bdc3c7;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;
}

.text-input:focus {
  border-color: #3498db;
}

.text-input::placeholder {
  color: #95a5a6;
}

.text-input:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.submit-button {
  padding: 12px 30px;
  font-size: 16px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background-color: #27ae60;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.submit-button:active {
  transform: translateY(0);
}

.submit-button:disabled {
  cursor: not-allowed !important;
  opacity: 0.6;
  background-color: #95a5a6;
}

.submit-button:disabled:hover {
  transform: none !important;
  background-color: #95a5a6 !important;
}

.feedback {
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
  display: none;
}

.feedback.show {
  display: block;
}

.feedback.correct {
  background-color: #d4edda;
  color: #155724;
  border: 2px solid #c3e6cb;
}

.feedback.incorrect {
  background-color: #f8d7da;
  color: #721c24;
  border: 2px solid #f5c6cb;
}

.explanation {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-weight: normal;
  font-size: 14px;
  text-align: left;
}

.next-button {
  margin-top: 15px;
  padding: 12px 30px;
  font-size: 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.next-button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.result-container {
  text-align: center;
  padding: 40px 20px;
}

.result-container h2 {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 30px;
}

.score-display {
  margin: 30px 0;
}

.score-number {
  font-size: 48px;
  font-weight: bold;
  color: #3498db;
  margin: 0;
}

.score-percentage {
  font-size: 24px;
  color: #7f8c8d;
  margin: 10px 0;
}

.result-message {
  font-size: 24px;
  margin: 30px 0;
}

.restart-button {
  padding: 15px 40px;
  font-size: 18px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.restart-button:hover {
  background-color: #27ae60;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.loading {
  text-align: center;
  color: #666;
  padding: 40px;
}

.error {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}`;
  
// export.jsの続き (Part 2)
// ※このコードは「export.js (完全版・一覧表示型対応)」の続きです

  console.log('✅ CSS取得成功');
  return cssContent;
}

/**
 * 一覧表示型のCSSを取得 🆕
 * 
 * @returns {string} CSS文字列
 */
function getListQuizCSS() {
  const cssContent = `/**
 * quiz-list.css
 * 一覧表示型クイズのスタイルシート
 */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f0f2f5;
  padding: 20px;
  line-height: 1.6;
}

#app, #quiz-app-root {
  max-width: 800px;
  margin: 0 auto;
}

.quiz-app-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.quiz-header-list {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.quiz-header-list h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

.quiz-info {
  font-size: 16px;
  opacity: 0.9;
}

.quiz-body-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-item-list {
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.question-number {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 10px;
}

.question-text-list {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
  line-height: 1.6;
}

.choices-container-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.choice-option {
  display: flex;
  align-items: center;
  padding: 15px;
  background: white;
  border: 2px solid #bdc3c7;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.choice-option:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.choice-option input[type="radio"] {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  cursor: pointer;
}

.choice-option label {
  flex: 1;
  font-size: 16px;
  color: #2c3e50;
  cursor: pointer;
}

.text-answer-container-list {
  margin-top: 10px;
}

.text-input-list {
  width: 100%;
  padding: 15px;
  font-size: 16px;
  border: 2px solid #bdc3c7;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;
}

.text-input-list:focus {
  border-color: #667eea;
}

.text-input-list:disabled {
  background: #ecf0f1;
  cursor: not-allowed;
}

.feedback-list {
  margin-top: 15px;
  padding: 12px 15px;
  border-radius: 8px;
  font-weight: bold;
  display: none;
}

.feedback-list.show {
  display: block;
}

.feedback-list.correct {
  background-color: #d4edda;
  color: #155724;
  border: 2px solid #c3e6cb;
}

.feedback-list.incorrect {
  background-color: #f8d7da;
  color: #721c24;
  border: 2px solid #f5c6cb;
}

.feedback-list.unanswered {
  background-color: #fff3cd;
  color: #856404;
  border: 2px solid #ffeaa7;
}

.explanation-list {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-weight: normal;
  font-size: 14px;
}

.quiz-footer-list {
  padding: 20px;
  text-align: center;
  background: #f8f9fa;
  border-top: 2px solid #e0e0e0;
}

.submit-all-button {
  padding: 18px 50px;
  font-size: 20px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.submit-all-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.submit-all-button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  box-shadow: none;
}

.result-area {
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.result-container-list {
  text-align: center;
}

.result-container-list h2 {
  font-size: 28px;
  margin-bottom: 20px;
}

.score-display-list {
  margin: 20px 0;
}

.score-number-list {
  font-size: 48px;
  font-weight: bold;
  margin: 0;
}

.score-percentage-list {
  font-size: 24px;
  margin: 10px 0;
  opacity: 0.9;
}

.result-message-list {
  font-size: 20px;
  margin-top: 20px;
}

.restart-button-list {
  margin-top: 20px;
  padding: 15px 40px;
  font-size: 18px;
  background-color: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.restart-button-list:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.loading {
  text-align: center;
  color: #666;
  padding: 40px;
}

.error {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}`;
  
  return cssContent;
}

/**
 * WordPress用のCSS文字列を生成
 * 
 * @returns {string} CSS文字列
 */
function generateWordPressCSS() {
  console.log('📝 WordPress用CSS生成開始');
  const cssContent = getQuizCSS();
  console.log('✅ CSS生成完了');
  return cssContent;
}

// =====================================
// 💾 ダウンロード処理
// =====================================

/**
 * テキストをファイルとしてダウンロード
 * 
 * @param {string} content - ファイルの内容
 * @param {string} filename - ファイル名
 * @param {string} mimeType - MIMEタイプ
 */
function downloadFile(content, filename, mimeType = 'text/plain') {
  console.log(`💾 ダウンロード開始: ${filename}`);
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log(`✅ ダウンロード完了: ${filename}`);
}

/**
 * WordPress用のファイルを一括ダウンロード
 * 
 * HTML、CSS、READMEの3ファイルをダウンロード
 */
function downloadAllFiles() {
  console.log('📦 一括ダウンロード開始');
  
  try {
    const htmlContent = generateWordPressHTML();
    downloadFile(htmlContent, 'quiz.html', 'text/html');
    
    const cssContent = generateWordPressCSS();
    downloadFile(cssContent, 'quiz.css', 'text/css');
    
    const readmeContent = `WordPress クイズアプリ セットアップ手順

【ファイル構成】
- quiz.html : クイズのHTML(全機能埋め込み済み)
- quiz.css  : クイズのスタイルシート

【WordPressへの設置方法】

方法1: カスタムHTMLブロックに貼り付け(最簡単)
-------------------------------------------------
1. WordPressの固定ページまたは投稿を開く
2. 「カスタムHTML」ブロックを追加
3. quiz.html の内容を全てコピー＆ペースト
4. 「外観」→「カスタマイズ」→「追加CSS」を開く
5. quiz.css の内容を全てコピー＆ペースト
6. 公開!

作成日: ${new Date().toLocaleString('ja-JP')}
`;
    downloadFile(readmeContent, 'README.txt', 'text/plain');
    
    console.log('✅ 一括ダウンロード完了');
    alert('✅ ダウンロード完了!\n\n以下の3ファイルが保存されました:\n- quiz.html\n- quiz.css\n- README.txt');
    
  } catch (error) {
    console.error('❌ ダウンロードエラー:', error);
    alert('❌ ダウンロード失敗: ' + error.message);
  }
}

/**
 * CSS埋め込み版のWordPress用HTMLを生成
 * 
 * @returns {string} 完全なHTML文字列
 */
function generateWordPressHTMLWithCSS() {
  console.log('📝 CSS埋め込み版HTML生成開始');
  
  const previewJsCode = getPreviewJsCode();
  const quizDataString = JSON.stringify(quizData, null, 2);
  const cssContent = getQuizCSS();
  
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${quizData.meta.title || 'クイズ'}</title>
  
  <style>
${cssContent}
  </style>
</head>
<body>
  <div id="quiz-app-root">
    <div class="loading">読み込み中...</div>
  </div>

  <script>
  const quizData = ${quizDataString};
  ${previewJsCode}
  
  document.addEventListener('DOMContentLoaded', function() {
    const rootElement = document.getElementById('quiz-app-root');
    if (rootElement) {
      rootElement.innerHTML = generateQuizHTML();
      showCurrentQuestion();
    }
  });
  </script>
</body>
</html>`;
  
  console.log('✅ CSS埋め込み版HTML生成完了');
  return html;
}

/**
 * WordPress用のファイルを一括ダウンロード(表示形式対応版) 🆕
 * 
 * displayTypeに応じて適切なHTMLを生成
 */
function downloadAllFilesWithOptions() {
  console.log('📦 一括ダウンロード開始(表示形式対応)');
  
  try {
    const displayType = quizData.meta.displayType || 'sequential';
    console.log('📊 表示形式:', displayType);
    
    // 1. 表示形式に応じたオールインワン版HTMLをダウンロード
    let allinoneHtml;
    let allinoneFilename;
    if (displayType === 'list') {
      allinoneHtml = generateWordPressHTMLList();
      allinoneFilename = 'quiz-allinone-list.html';
    } else {
      allinoneHtml = generateWordPressHTMLWithCSS();
      allinoneFilename = 'quiz-allinone.html';
    }
    downloadFile(allinoneHtml, allinoneFilename, 'text/html');
    
    // 2. 通常版HTMLファイルをダウンロード
    const htmlContent = generateWordPressHTML();
    downloadFile(htmlContent, 'quiz.html', 'text/html');
    
    // 3. CSSファイルをダウンロード
    let cssContent;
    let cssFilename;
    if (displayType === 'list') {
      cssContent = getListQuizCSS();
      cssFilename = 'quiz-list.css';
    } else {
      cssContent = generateWordPressCSS();
      cssFilename = 'quiz.css';
    }
    downloadFile(cssContent, cssFilename, 'text/css');
    
    // 4. README更新版
    const readmeContent = `WordPress クイズアプリ セットアップ手順

【ファイル構成】
${displayType === 'list' 
  ? '- quiz-allinone-list.html: クイズのHTML(一覧表示型・CSS埋め込み版)★おすすめ★' 
  : '- quiz-allinone.html: クイズのHTML(1問ずつ型・CSS埋め込み版)★おすすめ★'}
- quiz.html: クイズのHTML(CSS別ファイル)
${displayType === 'list' 
  ? '- quiz-list.css: クイズのスタイルシート(一覧表示型)' 
  : '- quiz.css: クイズのスタイルシート(1問ずつ型)'}

【表示形式】
現在の設定: ${displayType === 'list' ? '一覧表示' : '1問ずつ表示'}

${displayType === 'list' 
  ? `一覧表示型:
  - 全問題を一度に表示
  - 全問回答後に「採点」ボタンで一括判定
  - テスト・試験用に適している`
  : `1問ずつ表示型:
  - 1問ずつ表示し、回答後に「次へ」ボタンで進む
  - 学習用・練習用に適している`}

【WordPressへの設置方法】

★方法1: オールインワン版(最も簡単・おすすめ!)
-------------------------------------------------
1. WordPressの固定ページまたは投稿を開く
2. 「カスタムHTML」ブロックを追加
3. ${displayType === 'list' ? 'quiz-allinone-list.html' : 'quiz-allinone.html'} の内容を全てコピー＆ペースト
4. 公開!

→ これだけでOK!CSS設定不要!

作成日: ${new Date().toLocaleString('ja-JP')}
バージョン: MVP 1.1 (表示形式対応)
表示形式: ${displayType === 'list' ? '一覧表示' : '1問ずつ表示'}
`;
    downloadFile(readmeContent, 'README.txt', 'text/plain');
    
    console.log('✅ 一括ダウンロード完了');
    alert(`✅ ダウンロード完了!\n\n以下のファイルが保存されました:\n${displayType === 'list' 
      ? '- quiz-allinone-list.html(一覧表示型)★おすすめ' 
      : '- quiz-allinone.html(1問ずつ型)★おすすめ'}\n- quiz.html(通常版)\n- ${displayType === 'list' ? 'quiz-list.css' : 'quiz.css'}\n- README.txt\n\n初めての方は${displayType === 'list' ? ' quiz-allinone-list.html' : ' quiz-allinone.html'}をお使いください!`);
    
  } catch (error) {
    console.error('❌ ダウンロードエラー:', error);
    alert('❌ ダウンロード失敗: ' + error.message);
  }
}

/**
 * オールインワン版のみダウンロード(表示形式対応) 🆕
 */
function exportAllInOneWithDisplayType() {
  console.log('📥 オールインワン版ダウンロード(表示形式対応)');
  
  if (!validateQuizData()) return;
  
  try {
    const displayType = quizData.meta.displayType || 'sequential';
    console.log('📊 表示形式:', displayType);
    
    let html;
    let filename;
    
    if (displayType === 'list') {
      html = generateWordPressHTMLList();
      filename = 'quiz-allinone-list.html';
    } else {
      html = generateWordPressHTMLWithCSS();
      filename = 'quiz-allinone.html';
    }
    
    downloadFile(html, filename, 'text/html');
    
    alert(`✅ ダウンロード完了!\n\n${filename} をWordPressにコピペしてください。\n\n表示形式: ${displayType === 'list' ? '一覧表示(テスト形式)' : '1問ずつ表示(学習形式)'}`);
    
  } catch (error) {
    console.error('❌ ダウンロードエラー:', error);
    alert('❌ ダウンロード失敗: ' + error.message);
  }
}

/**
 * クイズデータのバリデーション
 */
function validateQuizData() {
  if (!quizData.questions || quizData.questions.length === 0) {
    alert('⚠️ 問題が1つもありません。\n\n先に問題を追加してください。');
    return false;
  }
  return true;
}

// =====================================
// 🔍 デバッグ用
// =====================================

if (typeof window !== 'undefined') {
  window.generateWordPressHTML = generateWordPressHTML;
  window.generateWordPressHTMLWithCSS = generateWordPressHTMLWithCSS;
  window.generateWordPressHTMLList = generateWordPressHTMLList;
  window.generateWordPressCSS = generateWordPressCSS;
  window.getQuizCSS = getQuizCSS;
  window.getListQuizCSS = getListQuizCSS;
  window.downloadFile = downloadFile;
  window.downloadAllFiles = downloadAllFiles;
  window.downloadAllFilesWithOptions = downloadAllFilesWithOptions;
  window.exportAllInOneWithDisplayType = exportAllInOneWithDisplayType;
  console.log('✅ export.js loaded');
  console.log('🔧 generateWordPressHTML関数が利用可能です');
  console.log('🔧 generateWordPressHTMLWithCSS関数が利用可能です(CSS埋め込み版)');
  console.log('🔧 generateWordPressHTMLList関数が利用可能です(一覧表示型)');
  console.log('🔧 downloadAllFilesWithOptions関数が利用可能です(推奨)');
  console.log('🔧 exportAllInOneWithDisplayType関数が利用可能です');
}