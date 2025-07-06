import { useState, useEffect } from 'react';
import { Plus, Book, Trophy, RefreshCw, Star, BarChart3 } from 'lucide-react';

const VocabularyApp = () => {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [currentDefinition, setCurrentDefinition] = useState('');
  const [currentTranslation, setCurrentTranslation] = useState('');
  const [quizMode, setQuizMode] = useState(false);
  const [quizWord, setQuizWord] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [activeTab, setActiveTab] = useState('add');

  // טעינת המילים מהזיכרון המקומי
  useEffect(() => {
    const savedWords = localStorage.getItem('vocabularyWords');
    if (savedWords) {
      setWords(JSON.parse(savedWords));
    }
  }, []);

  // שמירת המילים בזיכרון המקומי
  useEffect(() => {
    localStorage.setItem('vocabularyWords', JSON.stringify(words));
  }, [words]);

  // הוספת מילה חדשה
  const addWord = () => {
    if (currentWord.trim() && currentDefinition.trim() && currentTranslation.trim()) {
      const newWord = {
        id: Date.now(),
        word: currentWord.trim(),
        definition: currentDefinition.trim(),
        translation: currentTranslation.trim(),
        timesWrong: 0,
        timesCorrect: 0,
        lastSeen: new Date().toISOString(),
        level: 1 // רמת הלמידה
      };
      setWords([...words, newWord]);
      setCurrentWord('');
      setCurrentDefinition('');
      setCurrentTranslation('');
    }
  };

  // התחלת בדיקה
  const startQuiz = () => {
    if (words.length === 0) return;
    
    // בחירת מילה רנדומלית עם העדפה למילים שנענו לא נכון יותר פעמים
    const weightedWords = words.flatMap(word => {
      const weight = Math.max(1, word.timesWrong + 1);
      return Array(weight).fill(word);
    });
    
    const randomWord = weightedWords[Math.floor(Math.random() * weightedWords.length)];
    setQuizWord(randomWord);
    setQuizMode(true);
    setShowResult(false);
    setUserAnswer('');
  };

  // בדיקת התשובה
  const checkAnswer = () => {
    if (!quizWord) return;
    
    const correctAnswers = [
      quizWord.translation.toLowerCase(),
      quizWord.definition.toLowerCase()
    ];
    
    const isAnswerCorrect = correctAnswers.some(answer => 
      answer.includes(userAnswer.toLowerCase().trim()) || 
      userAnswer.toLowerCase().trim().includes(answer)
    );
    
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    
    // עדכון הסטטיסטיקות
    setWords(prevWords => 
      prevWords.map(word => 
        word.id === quizWord.id 
          ? {
              ...word,
              timesWrong: isAnswerCorrect ? word.timesWrong : word.timesWrong + 1,
              timesCorrect: isAnswerCorrect ? word.timesCorrect + 1 : word.timesCorrect,
              lastSeen: new Date().toISOString(),
              level: isAnswerCorrect ? Math.min(5, word.level + 1) : Math.max(1, word.level - 1)
            }
          : word
      )
    );
  };

  // המשך לשאלה הבאה
  const nextQuestion = () => {
    setQuizMode(false);
    setTimeout(() => startQuiz(), 100);
  };

  // חזרה לתפריט הראשי
  const exitQuiz = () => {
    setQuizMode(false);
    setShowResult(false);
    setQuizWord(null);
    setUserAnswer('');
  };

  // מחיקת מילה
  const deleteWord = (id) => {
    setWords(words.filter(word => word.id !== id));
  };

  // מיון המילים לפי רמת קושי
  const sortedWords = [...words].sort((a, b) => {
    const scoreA = a.timesWrong - a.timesCorrect;
    const scoreB = b.timesWrong - b.timesCorrect;
    return scoreB - scoreA;
  });

  const getLevelColor = (level) => {
    const colors = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-green-100 text-green-800',
      5: 'bg-blue-100 text-blue-800'
    };
    return colors[level] || colors[1];
  };

  const getLevelText = (level) => {
    const texts = {
      1: 'מתחיל',
      2: 'בסיסי',
      3: 'בינוני',
      4: 'מתקדם',
      5: 'מומחה'
    };
    return texts[level] || texts[1];
  };

  if (quizMode) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🧠 בדיקת מילים</h1>
          <p className="text-gray-600">מה המשמעות של המילה הבאה?</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-8 mb-6">
          <h2 className="text-4xl font-bold text-center text-blue-800 mb-4">
            {quizWord?.word}
          </h2>
          <div className="text-center text-sm text-gray-500">
            שגיאות: {quizWord?.timesWrong} | נכונות: {quizWord?.timesCorrect}
          </div>
        </div>

        {!showResult ? (
          <div className="space-y-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="הקלד את התרגום או ההגדרה..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
              autoFocus
            />
            <button
              onClick={checkAnswer}
              disabled={!userAnswer.trim()}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
            >
              בדוק תשובה
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`p-6 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-center">
                <div className="text-4xl mb-2">{isCorrect ? '✅' : '❌'}</div>
                <h3 className={`text-xl font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? 'נכון! כל הכבוד!' : 'לא נכון, אבל זה בסדר!'}
                </h3>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">התשובה הנכונה:</h4>
              <p className="text-gray-700 mb-1"><strong>תרגום:</strong> {quizWord?.translation}</p>
              <p className="text-gray-700"><strong>הגדרה:</strong> {quizWord?.definition}</p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={nextQuestion}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <RefreshCw size={20} />
                <span>שאלה הבאה</span>
              </button>
              <button
                onClick={exitQuiz}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700"
              >
                חזור לתפריט
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 אפליקציית מילים</h1>
        <p className="text-gray-600">למד מילים באנגלית ועקוב אחר ההתקדמות שלך</p>
      </div>

      {/* טאבים */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 ${
            activeTab === 'add' ? 'bg-white shadow-sm' : 'text-gray-600'
          }`}
        >
          <Plus size={20} />
          <span>הוספת מילה</span>
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 ${
            activeTab === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
          }`}
        >
          <Book size={20} />
          <span>רשימת מילים</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 ${
            activeTab === 'stats' ? 'bg-white shadow-sm' : 'text-gray-600'
          }`}
        >
          <BarChart3 size={20} />
          <span>סטטיסטיקות</span>
        </button>
      </div>

      {/* הוספת מילה */}
      {activeTab === 'add' && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">הוסף מילה חדשה</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={currentWord}
              onChange={(e) => setCurrentWord(e.target.value)}
              placeholder="מילה באנגלית..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              value={currentTranslation}
              onChange={(e) => setCurrentTranslation(e.target.value)}
              placeholder="תרגום לעברית..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              value={currentDefinition}
              onChange={(e) => setCurrentDefinition(e.target.value)}
              placeholder="הגדרה או הסבר באנגלית..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addWord}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span>הוסף מילה</span>
            </button>
          </div>
        </div>
      )}

      {/* רשימת מילים */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">המילים שלי ({words.length})</h2>
            <button
              onClick={startQuiz}
              disabled={words.length === 0}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Trophy size={20} />
              <span>התחל בדיקה</span>
            </button>
          </div>

          {words.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Book size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg">עדיין לא הוספת מילים</p>
              <p>הוסף מילה חדשה כדי להתחיל!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedWords.map((word) => (
                <div key={word.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-800">{word.word}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLevelColor(word.level)}`}>
                          {getLevelText(word.level)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-1"><strong>תרגום:</strong> {word.translation}</p>
                      <p className="text-gray-600 text-sm">{word.definition}</p>
                    </div>
                    <button
                      onClick={() => deleteWord(word.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      מחק
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      נכון: {word.timesCorrect}
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                      שגיאות: {word.timesWrong}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* סטטיסטיקות */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">סטטיסטיקות</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-800">{words.length}</div>
              <div className="text-sm text-gray-600">סך המילים</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-800">
                {words.reduce((sum, word) => sum + word.timesCorrect, 0)}
              </div>
              <div className="text-sm text-gray-600">תשובות נכונות</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-800">
                {words.reduce((sum, word) => sum + word.timesWrong, 0)}
              </div>
              <div className="text-sm text-gray-600">שגיאות</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-800">
                {words.filter(word => word.level >= 4).length}
              </div>
              <div className="text-sm text-gray-600">מילים מתקדמות</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">מילים הכי קשות (צריכות תרגול)</h3>
            {words.filter(word => word.timesWrong > word.timesCorrect).length === 0 ? (
              <p className="text-gray-500">כל המילים שלך במצב טוב! 🎉</p>
            ) : (
              <div className="space-y-2">
                {words
                  .filter(word => word.timesWrong > word.timesCorrect)
                  .sort((a, b) => b.timesWrong - a.timesWrong)
                  .slice(0, 5)
                  .map((word) => (
                    <div key={word.id} className="flex justify-between items-center bg-white p-2 rounded">
                      <span className="font-medium">{word.word}</span>
                      <span className="text-sm text-red-600">{word.timesWrong} שגיאות</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabularyApp;