/**
 * preview.js
 * 
 * クイズをブラウザに表示するためのファイル
 * data.jsのquizDataを読み込んで、HTMLに変換します
 */

// =====================================
// 📦 グローバル変数
// =====================================

/**
 * 現在表示している問題のインデックス
 * 0から始まる（最初の問題は0）
 */
let currentQuestionIndex = 0;

/**
 * ユーザーのスコア（正解数）
 */
let score = 0;

// =====================================
// 🎨 HTML生成関数
// =====================================

/**
 * クイズ全体の骨組みHTMLを生成
 * 
 * この関数が作るHTML構造：
 * <div class="quiz-app">
 *   <div class="quiz-header">
 *     <h1>クイズタイトル</h1>
 *   </div>
 *   <div class="quiz-body">
 *     ここに問題が入る
 *   </div>
 * </div>
 * 
 * @returns {string} HTML文字列
 */
function generateQuizHTML() {
  console.log('🎨 generateQuizHTML が呼ばれました');
  
  // quizDataが存在するか確認
  if (!quizData || !quizData.questions) {
    console.error('❌ quizDataが見つかりません');
    return '<p>⚠️ クイズデータが読み込まれていません</p>';
  }
  
  console.log('✅ quizData確認OK:', quizData);
  
  // タイトルを取得（なければデフォルト）
  const title = quizData.meta.title || 'クイズ';
  
  // HTML文字列を組み立てる
  const html = `
    <div class="quiz-app">
      <!-- ヘッダー部分 -->
      <div class="quiz-header">
        <h1>${title}</h1>
        <p class="quiz-progress">問題 <span id="current-question">1</span> / ${quizData.questions.length}</p>
      </div>
      
      <!-- 問題表示エリア -->
      <div class="quiz-body" id="quiz-body">
        ここに問題が表示されます
      </div>
    </div>
  `;
  
  console.log('✅ HTML生成完了');
  return html;
}

// =====================================
// 🎯 問題表示関数（choice型）
// =====================================

/**
 * choice型の問題を表示するHTMLを生成
 * 
 * choice型の構造：
 * {
 *   type: "choice",
 *   question: "質問文",
 *   choices: ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
 *   answer: 0  // 正解のインデックス
 * }
 * 
 * @param {Object} questionData - 問題データ
 * @param {number} questionIndex - 問題番号（0から始まる）
 * @returns {string} HTML文字列
 */
function renderChoiceQuestion(questionData, questionIndex) {
  console.log(`🎯 choice問題を描画: ${questionData.question}`);
  
  // 質問文
  const questionText = questionData.question;
  
  // 選択肢ボタンを生成
  let choicesHTML = '';
  
  // choices配列をループして、4つのボタンを作る
  questionData.choices.forEach((choice, index) => {
    choicesHTML += `
      <button 
        class="choice-button" 
        onclick="handleChoiceClick(${questionIndex}, ${index})"
        data-index="${index}">
        ${choice}
      </button>
    `;
  });
  
  // 全体のHTML
  const html = `
    <div class="question-container" data-question-id="${questionData.id}">
      <h2 class="question-text">${questionText}</h2>
      <div class="choices-container">
        ${choicesHTML}
      </div>
      <div class="feedback" id="feedback"></div>
    </div>
  `;
  
  return html;
}

// =====================================
// 🎯 問題表示関数（text型）
// =====================================

/**
 * text型の問題を表示するHTMLを生成
 * 
 * text型の構造：
 * {
 *   type: "text",
 *   question: "質問文",
 *   answer: "正解の文字列"
 * }
 * 
 * @param {Object} questionData - 問題データ
 * @param {number} questionIndex - 問題番号（0から始まる）
 * @returns {string} HTML文字列
 */
function renderTextQuestion(questionData, questionIndex) {
  console.log(`✏️ text問題を描画: ${questionData.question}`);
  
  // 質問文
  const questionText = questionData.question;
  
  // 全体のHTML
  const html = `
    <div class="question-container" data-question-id="${questionData.id}">
      <h2 class="question-text">${questionText}</h2>
      <div class="text-answer-container">
        <input 
          type="text" 
          class="text-input" 
          id="text-input-${questionIndex}"
          placeholder="答えを入力してください"
          autocomplete="off">
        <button 
          class="submit-button" 
          onclick="handleTextSubmit(${questionIndex})">
          回答する
        </button>
      </div>
      <div class="feedback" id="feedback"></div>
    </div>
  `;
  
  return html;
}

// =====================================
// ✅ 回答判定関数（text型）
// =====================================

/**
 * text型の回答を判定する(複数正解対応版) 🆕
 * 
 * @param {number} questionIndex - 問題番号(0から始まる)
 */
function handleTextSubmit(questionIndex) {
  console.log(`📝 回答ボタンがクリックされました: 問題${questionIndex}`);
  
  const questionData = quizData.questions[questionIndex];
  const inputElement = document.getElementById(`text-input-${questionIndex}`);
  const userAnswer = inputElement.value;
  
  console.log(`入力された答え: "${userAnswer}"`);
  
  if (userAnswer.trim() === '') {
    alert('答えを入力してください');
    return;
  }
  
  // 🆕 複数正解に対応した判定
  let isCorrect = false;
  let correctAnswerText = '';
  
  if (Array.isArray(questionData.answer)) {
    // 複数正解の場合: いずれかに一致すればOK
    correctAnswerText = questionData.answer[0]; // 表示用に最初の正解を使用
    isCorrect = questionData.answer.some(ans => 
      userAnswer.trim().toLowerCase() === ans.toLowerCase()
    );
    console.log(`複数正解判定: ${questionData.answer.join(', ')}`);
  } else {
    // 単一正解の場合
    correctAnswerText = questionData.answer;
    isCorrect = userAnswer.trim().toLowerCase() === correctAnswerText.toLowerCase();
    console.log(`単一正解判定: ${correctAnswerText}`);
  }
  
  const feedbackElement = document.getElementById('feedback');
  
  if (isCorrect) {
    console.log('✅ 正解!');
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
    console.log('❌ 不正解');
    
    let feedbackHTML = `❌ 不正解。正解は「${correctAnswerText}」です。`;
    
    // 複数正解がある場合は他の正解も表示
    if (Array.isArray(questionData.answer) && questionData.answer.length > 1) {
      feedbackHTML += `<br><small>他の正解: ${questionData.answer.slice(1).join(', ')}</small>`;
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
  
  console.log(`📊 現在のスコア: ${score} / ${questionIndex + 1}`);
  
  showNextButton();
}

// =====================================
// 🎓 初級者向け説明
// =====================================

/**
 * 【Array.isArray()とは】
 * 
 * 変数が配列かどうかを判定する関数
 * 
 * Array.isArray([1, 2, 3])  → true
 * Array.isArray("hello")    → false
 * Array.isArray(123)        → false
 * 
 * 使い方:
 * if (Array.isArray(questionData.answer)) {
 *   // answerが配列の場合(複数正解)
 * } else {
 *   // answerが文字列の場合(単一正解)
 * }
 */

/**
 * 【Array.some()とは】
 * 
 * 配列の要素のいずれかが条件を満たすか判定
 * 
 * const numbers = [1, 2, 3, 4, 5];
 * numbers.some(n => n > 3)  → true (4と5が該当)
 * numbers.some(n => n > 10) → false (該当なし)
 * 
 * 複数正解の判定に使用:
 * questionData.answer.some(ans => 
 *   userAnswer === ans  // いずれかの正解に一致するか
 * )
 */

/**
 * 【Array.slice()とは】
 * 
 * 配列の一部を取り出す
 * 
 * const arr = ['a', 'b', 'c', 'd'];
 * arr.slice(1)    → ['b', 'c', 'd']  (インデックス1から最後まで)
 * arr.slice(0, 2) → ['a', 'b']       (インデックス0から2の手前まで)
 * 
 * 使い方:
 * questionData.answer.slice(1)
 * → 最初の正解以外を取り出す(2番目以降の正解を表示するため)
 */

// =====================================
// ✅ 回答判定関数（choice型）
// =====================================

/**
 * choice型の回答を判定する
 * 
 * ユーザーが選択肢ボタンをクリックしたときに呼ばれます
 * 
 * @param {number} questionIndex - 問題番号（0から始まる）
 * @param {number} selectedIndex - クリックされた選択肢のインデックス（0〜3）
 */
function handleChoiceClick(questionIndex, selectedIndex) {
  console.log(`🖱️ 選択肢がクリックされました: 問題${questionIndex}, 選択肢${selectedIndex}`);
  
  // 該当する問題データを取得
  const questionData = quizData.questions[questionIndex];
  
  // 正解のインデックスを取得
  const correctIndex = questionData.answer;
  
  // 正解か不正解か判定
  const isCorrect = (selectedIndex === correctIndex);
  
  // フィードバック要素を取得
  const feedbackElement = document.getElementById('feedback');
  
  if (isCorrect) {
    // 正解の場合
    console.log('✅ 正解！');
    score++; // スコアを1増やす
    
    let feedbackHTML = '🎉 正解！';
    if (questionData.explanation) {
      feedbackHTML += '<div class="explanation">' + questionData.explanation + '</div>';
    }
    
    feedbackElement.innerHTML = feedbackHTML;
    feedbackElement.className = 'feedback show correct';
  } else {
    // 不正解の場合
    console.log('❌ 不正解');
    
    const correctAnswer = questionData.choices[correctIndex];
    let feedbackHTML = `❌ 不正解。正解は「${correctAnswer}」です。`;
    if (questionData.explanation) {
      feedbackHTML += '<div class="explanation">' + questionData.explanation + '</div>';
    }
    
    feedbackElement.innerHTML = feedbackHTML;
    feedbackElement.className = 'feedback show incorrect';
  }
  
  // 全てのボタンを無効化（連続クリック防止）
  const buttons = document.querySelectorAll('.choice-button');
  buttons.forEach(button => {
    button.disabled = true;
    button.style.cursor = 'not-allowed';
    button.style.opacity = '0.6';
  });
  
  // クリックされたボタンを強調
  const clickedButton = document.querySelector(`.choice-button[data-index="${selectedIndex}"]`);
  if (isCorrect) {
    clickedButton.style.backgroundColor = '#27ae60';
    clickedButton.style.color = 'white';
    clickedButton.style.borderColor = '#27ae60';
  } else {
    clickedButton.style.backgroundColor = '#e74c3c';
    clickedButton.style.color = 'white';
    clickedButton.style.borderColor = '#e74c3c';
    
    // 正解のボタンも表示
    const correctButton = document.querySelector(`.choice-button[data-index="${correctIndex}"]`);
    correctButton.style.backgroundColor = '#27ae60';
    correctButton.style.color = 'white';
    correctButton.style.borderColor = '#27ae60';
  }
  
  console.log(`📊 現在のスコア: ${score} / ${questionIndex + 1}`);
  
  // 「次へ」ボタンを表示
  showNextButton();
}

// =====================================
// 🔀 問題タイプ別の振り分け関数
// =====================================

/**
 * 問題のtypeに応じて適切な描画関数を呼び出す
 * 
 * これが「振り分け役」の関数です。
 * switch文でtypeを判定し、対応する関数を呼び出します。
 * 
 * @param {Object} questionData - 問題データ
 * @param {number} questionIndex - 問題番号（0から始まる）
 * @returns {string} HTML文字列
 */
function renderQuestion(questionData, questionIndex) {
  console.log(`🔀 問題タイプを判定: ${questionData.type}`);
  
  // typeプロパティで処理を分岐
  switch (questionData.type) {
    case 'choice':
      // 4択クイズの場合
      return renderChoiceQuestion(questionData, questionIndex);
      
    case 'text':
      // テキスト入力の場合
      return renderTextQuestion(questionData, questionIndex);
      
    default:
      // 未対応の形式の場合
      console.error(`❌ 未対応の問題タイプ: ${questionData.type}`);
      return `<p class="error">⚠️ 未対応の問題形式です: ${questionData.type}</p>`;
  }
}

// =====================================
// 🎓 初級者向け説明コーナー
// =====================================

/**
 * 【テンプレートリテラル】
 * 
 * `バッククォート` で囲むと：
 * - 改行をそのまま書ける
 * - ${変数} で値を埋め込める
 * 
 * 例：
 * const name = "太郎";
 * const message = `こんにちは、${name}さん！`;
 * → "こんにちは、太郎さん！"
 */

/**
 * 【関数とは】
 * 
 * function 関数名() {
 *   処理
 *   return 結果;
 * }
 * 
 * - 何度も使う処理をまとめる
 * - return で結果を返す
 * - 呼び出し方: const result = 関数名();
 */

/**
 * 【forEach とは】
 * 
 * 配列の各要素に対して処理を実行する
 * 
 * 例：
 * const fruits = ["りんご", "バナナ", "みかん"];
 * fruits.forEach((fruit, index) => {
 *   console.log(`${index}: ${fruit}`);
 * });
 * 
 * 出力：
 * 0: りんご
 * 1: バナナ
 * 2: みかん
 * 
 * - fruit = 各要素の値
 * - index = 何番目か（0から始まる）
 */

/**
 * 【文字列の連結】
 * 
 * += 演算子で文字列を追加していく
 * 
 * let text = "";
 * text += "こんにちは";
 * text += "世界";
 * // text = "こんにちは世界"
 * 
 * この関数では、choicesHTMLに
 * ボタンのHTMLを1つずつ追加している
 */

/**
 * 【data属性とは】
 * 
 * data-xxx という属性で、HTML要素にデータを保存できる
 * 
 * <button data-index="0">選択肢</button>
 * 
 * JavaScriptから読み取れる：
 * button.dataset.index  // "0"
 * 
 * この関数では、どのボタンが押されたか判定するために使う
 */

/**
 * 【switch文とは】
 * 
 * 値によって処理を分岐させる構文
 * 
 * switch (値) {
 *   case '値1':
 *     処理1;
 *     break;
 *   case '値2':
 *     処理2;
 *     break;
 *   default:
 *     どれにも当てはまらない時の処理;
 * }
 * 
 * 例：
 * const type = "choice";
 * switch (type) {
 *   case "choice":
 *     console.log("4択問題");
 *     break;
 *   case "text":
 *     console.log("テキスト問題");
 *     break;
 * }
 * 
 * returnを使う場合、breakは不要（関数が終了するため）
 */

// =====================================
// 🎮 クイズ進行制御
// =====================================

/**
 * 「次へ」ボタンを表示
 */
function showNextButton() {
  // 既にボタンがある場合は何もしない
  if (document.getElementById('next-button')) {
    return;
  }
  
  const feedbackElement = document.getElementById('feedback');
  
  const nextButton = document.createElement('button');
  nextButton.id = 'next-button';
  nextButton.className = 'next-button';
  nextButton.textContent = '次へ ➡️';
  nextButton.onclick = nextQuestion;
  
  feedbackElement.appendChild(nextButton);
}

/**
 * 現在の問題を表示する
 */
function showCurrentQuestion() {
  console.log(`📄 問題${currentQuestionIndex + 1}を表示`);
  
  // 問題データを取得
  const questionData = quizData.questions[currentQuestionIndex];
  
  // 問題を描画
  const questionHTML = renderQuestion(questionData, currentQuestionIndex);
  
  // quiz-bodyに表示
  const quizBody = document.getElementById('quiz-body');
  quizBody.innerHTML = questionHTML;
  
  // 進行状況を更新
  updateProgress();
}

/**
 * 進行状況を更新（問題 X / Y）
 */
function updateProgress() {
  const currentQuestionElement = document.getElementById('current-question');
  if (currentQuestionElement) {
    currentQuestionElement.textContent = currentQuestionIndex + 1;
  }
}

/**
 * 次の問題に進む、または結果を表示
 */
function nextQuestion() {
  console.log('➡️ 次の問題へ');
  
  currentQuestionIndex++;
  
  // まだ問題が残っている場合
  if (currentQuestionIndex < quizData.questions.length) {
    showCurrentQuestion();
  } else {
    // 全問題終了
    showResult();
  }
}

/**
 * 結果画面を表示
 */
function showResult() {
  console.log('🏁 クイズ終了');
  
  const totalQuestions = quizData.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  
  let message = '';
  if (percentage === 100) {
    message = '🎉 完璧です！';
  } else if (percentage >= 80) {
    message = '👏 素晴らしい！';
  } else if (percentage >= 60) {
    message = '👍 よくできました！';
  } else {
    message = '💪 もう一度挑戦してみましょう！';
  }
  
  const resultHTML = `
    <div class="result-container">
      <h2>クイズ終了！</h2>
      <div class="score-display">
        <p class="score-number">${score} / ${totalQuestions}</p>
        <p class="score-percentage">(${percentage}%)</p>
      </div>
      <p class="result-message">${message}</p>
      <button class="restart-button" onclick="restartQuiz()">
        もう一度挑戦
      </button>
    </div>
  `;
  
  const quizBody = document.getElementById('quiz-body');
  quizBody.innerHTML = resultHTML;
}

/**
 * クイズをリスタート
 */
function restartQuiz() {
  console.log('🔄 クイズをリスタート');
  
  // 変数をリセット
  currentQuestionIndex = 0;
  score = 0;
  
  // 最初の問題を表示
  showCurrentQuestion();
}

/**
 * クイズを初期化して開始
 */
function initQuiz() {
  console.log('🎬 クイズを初期化');
  
  // quiz-appのHTMLを生成
  const appElement = document.getElementById('app');
  appElement.innerHTML = generateQuizHTML();
  
  // 最初の問題を表示
  showCurrentQuestion();
}

// =====================================
// 🔍 デバッグ用
// =====================================

// ブラウザのコンソールで動作確認できるようにする
if (typeof window !== 'undefined') {
  window.generateQuizHTML = generateQuizHTML;
  window.renderChoiceQuestion = renderChoiceQuestion;
  window.renderTextQuestion = renderTextQuestion;
  window.renderQuestion = renderQuestion;
  window.showCurrentQuestion = showCurrentQuestion;
  window.nextQuestion = nextQuestion;
  window.showResult = showResult;
  window.restartQuiz = restartQuiz;
  window.initQuiz = initQuiz;
  console.log('✅ preview.js loaded');
  console.log('🔧 initQuiz関数が利用可能です');
}