/**
 * data.js
 * 
 * クイズデータの定義ファイル
 * このオブジェクトが全てのクイズ情報を保持します。
 */

/**
 * quizData - クイズの全データ
 * 
 * @property {Object} meta - クイズ全体の設定
 * @property {string} meta.title - クイズのタイトル
 * @property {boolean} meta.shuffle - 問題順をシャッフルするか
 * @property {string} meta.displayType - 表示形式("sequential" または "list")
 * 
 * @property {Array} questions - 問題の配列
 * @property {string} questions[].id - 問題の一意識別子
 * @property {string} questions[].type - 問題形式("choice" または "text")
 * @property {string} questions[].question - 質問文
 * @property {string} questions[].image - 問題画像(Base64またはURL・任意) 🆕
 * @property {Array} questions[].choices - 選択肢配列(choice型のみ)
 * @property {Array} questions[].choiceImages - 選択肢画像配列(任意) 🆕
 * @property {Array|string|number} questions[].answer - 正解
 * @property {string} questions[].explanation - 解説(任意)
 */
const quizData = {
  // クイズ全体の設定
  meta: {
    title: "サンプルクイズ",
    shuffle: false,
    displayType: "sequential"
  },
  
  // 問題のリスト
  questions: [
    // ========================================
    // 問題1: choice(4択クイズ)
    // ========================================
    {
      id: "q1",
      type: "choice",
      question: "日本で一番高い山は?",
      image: "", // 🆕 問題画像(Base64 or URL)
      choices: [
        "富士山",
        "北岳",
        "槍ヶ岳",
        "立山"
      ],
      choiceImages: [], // 🆕 選択肢画像配列 ["", "", "", ""]
      answer: 0,
      explanation: "富士山は標高3776mで日本一高い山です。"
    },
    
    // ========================================
    // 問題2: text(一問一答)
    // ========================================
    {
      id: "q2",
      type: "text",
      question: "What is the capital of Japan?",
      image: "", // 🆕 問題画像
      answer: "Tokyo",
      explanation: "Tokyo has been the capital of Japan since 1868."
    }
  ]
};

// =====================================
// 🎓 初級者向け説明コーナー
// =====================================

/**
 * 【画像の追加方法】
 * 
 * 1. Base64形式(おすすめ):
 *    image: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 *    - 画像データを文字列として埋め込む
 *    - 外部ファイル不要でWordPressに貼り付けるだけで動作
 *    - ファイルサイズが大きくなる
 * 
 * 2. URL形式:
 *    image: "https://example.com/image.jpg"
 *    - 外部の画像URLを指定
 *    - ファイルサイズは小さい
 *    - 外部サーバーが必要
 * 
 * 3. 画像なし:
 *    image: ""
 *    - 空文字列の場合は画像を表示しない
 */

/**
 * 【choiceImagesとは】
 * 
 * choice型の選択肢に画像を使う場合に使用します。
 * 
 * 例:
 * choices: ["選択肢1", "選択肢2", "選択肢3", "選択肢4"]
 * choiceImages: [
 *   "data:image/png;base64,...", // 選択肢1の画像
 *   "",                           // 選択肢2は画像なし
 *   "https://example.com/3.jpg",  // 選択肢3の画像
 *   ""                            // 選択肢4は画像なし
 * ]
 * 
 * - 配列の長さはchoicesと同じ(4つ)
 * - 画像がない選択肢は空文字列 ""
 * - テキストと画像の両方を表示可能
 */

/**
 * 【displayTypeとは】
 * 
 * クイズの表示形式を制御するプロパティです。
 * 
 * "sequential" (デフォルト):
 * - 1問ずつ表示
 * - 回答後に「次へ」ボタンで進む
 * - 既存のクイズ形式
 * 
 * "list":
 * - 全問題を一覧で表示
 * - 全問回答してから「採点」ボタン
 * - テスト形式に適している
 */

/**
 * 【複数正解(answer配列)】
 * 
 * text型で複数の正解パターンを設定できます。
 * 
 * 正解が1つ:
 * answer: "東京"
 * 
 * 正解が複数(表記ゆれ対応):
 * answer: ["東京", "tokyo", "トウキョウ"]
 * 
 * いずれかに一致すれば正解になります。
 */

// =====================================
// 🔍 デバッグ用
// =====================================

if (typeof window !== 'undefined') {
  window.quizData = quizData;
  console.log('✅ data.js loaded (画像対応版)');
  console.log('📊 Current quizData:', quizData);
  console.log('📝 問題数:', quizData.questions.length);
  console.log('🎨 表示形式:', quizData.meta.displayType);
  
  quizData.questions.forEach((q, index) => {
    const hasImage = q.image ? '🖼️' : '';
    const hasChoiceImages = q.choiceImages && q.choiceImages.some(img => img) ? '🎨' : '';
    console.log(`問題${index + 1} [${q.type}]: ${q.question} ${hasImage}${hasChoiceImages}`);
  });
}