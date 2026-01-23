/**
 * csv-loader.js
 * 
 * CSVファイルから問題を読み込む機能
 * 複数正解(answer2, answer3...)に対応
 */

// =====================================
// 📁 CSVファイル読み込み
// =====================================

/**
 * CSVファイルを選択してアップロード
 */
function selectCSVFile() {
  console.log('📁 CSVファイル選択');
  
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      readCSVFile(file);
    }
  };
  
  input.click();
}

/**
 * CSVファイルを読み込む
 * 
 * @param {File} file - 選択されたファイル
 */
function readCSVFile(file) {
  console.log('📖 CSVファイル読み込み開始:', file.name);
  
  if (!file.name.endsWith('.csv')) {
    alert('❌ CSVファイルを選択してください');
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = (event) => {
    const csvText = event.target.result;
    console.log('✅ ファイル読み込み完了');
    parseCSV(csvText);
  };
  
  reader.onerror = () => {
    console.error('❌ ファイル読み込みエラー');
    alert('❌ ファイルの読み込みに失敗しました');
  };
  
  reader.readAsText(file, 'UTF-8');
}

// =====================================
// 🔍 CSV解析
// =====================================

/**
 * CSVテキストを解析して問題データに変換
 * 
 * @param {string} csvText - CSVの内容
 */
function parseCSV(csvText) {
  console.log('🔍 CSV解析開始');
  
  try {
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length < 2) {
      alert('❌ CSVファイルが空です');
      return;
    }
    
    // ヘッダー行を解析
    const headers = parseCSVLine(lines[0]);
    console.log('📋 ヘッダー:', headers);
    
    // ヘッダーの検証
    const requiredHeaders = ['type', 'question', 'answer'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      alert(`❌ 必須カラムが不足しています: ${missingHeaders.join(', ')}\n\n必須: type, question, answer`);
      return;
    }
    
    // データ行を解析
    const questions = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      try {
        const question = parseQuestionLine(line, headers);
        if (question) {
          questions.push(question);
        }
      } catch (error) {
        console.error(`❌ ${i + 1}行目でエラー:`, error.message);
        if (!confirm(`${i + 1}行目でエラーが発生しました:\n${error.message}\n\n続行しますか?`)) {
          return;
        }
      }
    }
    
    if (questions.length === 0) {
      alert('❌ 読み込める問題がありませんでした');
      return;
    }
    
    console.log(`✅ ${questions.length}問を読み込みました`);
    showImportConfirmDialog(questions);
    
  } catch (error) {
    console.error('❌ CSV解析エラー:', error);
    alert(`❌ CSV解析エラー: ${error.message}`);
  }
}

/**
 * CSV行を解析(カンマ区切り、ダブルクォート対応)
 * 
 * @param {string} line - CSV行
 * @returns {Array<string>} カラムの配列
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * 問題行を解析してquestionオブジェクトに変換
 * 
 * @param {string} line - CSV行
 * @param {Array<string>} headers - ヘッダー配列
 * @returns {Object|null} 問題オブジェクト
 */
function parseQuestionLine(line, headers) {
  const values = parseCSVLine(line);
  
  while (values.length < headers.length) {
    values.push('');
  }
  
  const row = {};
  headers.forEach((header, index) => {
    row[header] = values[index] || '';
  });
  
  const type = row.type.toLowerCase();
  if (type !== 'choice' && type !== 'text') {
    throw new Error(`未対応のtype: ${row.type} (choice または text を指定してください)`);
  }
  
  if (!row.question) {
    throw new Error('question列が空です');
  }
  
  const question = {
    id: `q${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: type,
    question: row.question,
    explanation: row.explanation || ''
  };
  
  if (type === 'choice') {
    // choice型の処理
    const choices = [
      row.choice1 || '',
      row.choice2 || '',
      row.choice3 || '',
      row.choice4 || ''
    ];
    
    if (choices.some(c => !c)) {
      throw new Error('choice型の選択肢が不足しています(choice1〜choice4が必要)');
    }
    
    question.choices = choices;
    
    const answerIndex = parseInt(row.answer);
    if (isNaN(answerIndex) || answerIndex < 0 || answerIndex > 3) {
      throw new Error(`choice型のanswerは0〜3の数字で指定してください: ${row.answer}`);
    }
    question.answer = answerIndex;
    
  } else {
    // 🆕 text型の処理(複数正解対応)
    if (!row.answer) {
      throw new Error('text型のanswerが空です');
    }
    
    // 複数の正解パターンを収集
    const answers = [row.answer];
    
    // answer2, answer3, answer4... を探す
    let answerNum = 2;
    while (row[`answer${answerNum}`]) {
      const additionalAnswer = row[`answer${answerNum}`].trim();
      if (additionalAnswer) {
        answers.push(additionalAnswer);
      }
      answerNum++;
    }
    
    // 1つだけの場合は文字列、複数の場合は配列として保存
    if (answers.length === 1) {
      question.answer = answers[0];
    } else {
      question.answer = answers; // 🆕 配列として保存
      console.log(`📝 複数正解を設定: ${answers.join(', ')}`);
    }
  }
  
  return question;
}

// =====================================
// 💬 インポート確認ダイアログ
// =====================================

/**
 * インポート確認ダイアログを表示
 * 
 * @param {Array<Object>} questions - 読み込んだ問題配列
 */
function showImportConfirmDialog(questions) {
  const choiceCount = questions.filter(q => q.type === 'choice').length;
  const textCount = questions.filter(q => q.type === 'text').length;
  const multiAnswerCount = questions.filter(q => Array.isArray(q.answer)).length;
  
  let message = `📊 読み込み結果\n\n` +
    `総問題数: ${questions.length}問\n` +
    `- choice型: ${choiceCount}問\n` +
    `- text型: ${textCount}問`;
  
  if (multiAnswerCount > 0) {
    message += `\n  └ 複数正解: ${multiAnswerCount}問`;
  }
  
  message += `\n\n既存の問題をどうしますか?`;
  
  const choice = confirm(message + '\n\n「OK」= 置き換える / 「キャンセル」= 追加する');
  
  if (choice === null) {
    console.log('❌ インポートをキャンセルしました');
    return;
  }
  
  if (choice) {
    replaceQuestions(questions);
  } else {
    if (confirm('既存の問題に追加しますか?\n\n「OK」= 追加する / 「キャンセル」= キャンセル')) {
      addQuestions(questions);
    } else {
      console.log('❌ インポートをキャンセルしました');
    }
  }
}

/**
 * 既存の問題を全て置き換える
 * 
 * @param {Array<Object>} questions - 新しい問題配列
 */
function replaceQuestions(questions) {
  console.log('🔄 問題を置き換え');
  
  quizData.questions = questions;
  
  renderQuestionList();
  updatePreview();
  updateExportInfo();
  
  alert(`✅ ${questions.length}問を読み込みました\n(既存の問題は削除されました)`);
}

/**
 * 既存の問題に追加する
 * 
 * @param {Array<Object>} questions - 追加する問題配列
 */
function addQuestions(questions) {
  console.log('➕ 問題を追加');
  
  const oldCount = quizData.questions.length;
  quizData.questions.push(...questions);
  
  renderQuestionList();
  updatePreview();
  updateExportInfo();
  
  alert(`✅ ${questions.length}問を追加しました\n(合計: ${quizData.questions.length}問)`);
}

// =====================================
// 📥 サンプルCSVダウンロード
// =====================================

/**
 * サンプルCSVファイルをダウンロード
 */
function downloadSampleCSV() {
  console.log('📥 サンプルCSVダウンロード');
  
  const sampleCSV = `type,question,choice1,choice2,choice3,choice4,answer,answer2,answer3,explanation
choice,日本で一番高い山は?,富士山,北岳,槍ヶ岳,立山,0,,,富士山は標高3776mで日本一高い山です。
choice,東京タワーの高さは?,333m,444m,555m,666m,0,,,東京タワーは333mです。
text,日本の首都は?,,,,,東京,tokyo,トウキョウ,表記ゆれに対応しています。
text,What is the capital of Japan?,,,,,Tokyo,tokyo,TOKYO,大文字小文字を区別しません。
text,円周率は?,,,,,3.14,3.141592,π,複数の答え方に対応しています。
choice,1+1=?,1,2,3,4,1,,,`;
  
  downloadFile(sampleCSV, 'quiz-sample.csv', 'text/csv');
  
  alert('✅ サンプルCSVをダウンロードしました\n\n複数正解(answer2, answer3)の例も含まれています。');
}

// =====================================
// 🎓 初級者向け説明コーナー
// =====================================

/**
 * 【複数正解の仕組み】
 * 
 * text型の問題で、answer, answer2, answer3... に値を設定すると、
 * そのいずれかに一致すれば正解になります。
 * 
 * 例:
 * question: 日本の首都は?
 * answer: 東京
 * answer2: tokyo
 * answer3: トウキョウ
 * 
 * → ユーザーが「東京」「tokyo」「トウキョウ」のいずれかを
 *   入力すれば正解になります。
 * 
 * 判定時は大文字小文字を区別しないので、
 * 「TOKYO」「Tokyo」なども正解になります。
 */

/**
 * 【配列と文字列の使い分け】
 * 
 * 正解が1つの場合:
 * question.answer = "東京"  (文字列)
 * 
 * 正解が複数の場合:
 * question.answer = ["東京", "tokyo", "トウキョウ"]  (配列)
 * 
 * Array.isArray()で判定:
 * if (Array.isArray(question.answer)) {
 *   // 複数正解
 * } else {
 *   // 単一正解
 * }
 */

/**
 * 【動的なプロパティアクセス】
 * 
 * row[`answer${answerNum}`]
 * 
 * これは row.answer2, row.answer3... を動的に取得する方法です。
 * 
 * テンプレートリテラル(``)を使って、
 * 変数の値を埋め込んだプロパティ名を作成しています。
 * 
 * answerNum = 2 のとき → row['answer2'] → row.answer2
 * answerNum = 3 のとき → row['answer3'] → row.answer3
 */

// =====================================
// 🔍 デバッグ用
// =====================================

if (typeof window !== 'undefined') {
  window.selectCSVFile = selectCSVFile;
  window.downloadSampleCSV = downloadSampleCSV;
  console.log('✅ csv-loader.js loaded (複数正解対応版)');
  console.log('🔧 selectCSVFile関数が利用可能です');
  console.log('🔧 downloadSampleCSV関数が利用可能です');
}