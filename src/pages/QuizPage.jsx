import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, RefreshCw, Flame, ArrowRight, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    title: 'Bubble Sort Pass Prediction',
    question: 'After 1 complete pass of Bubble Sort on array [5, 1, 4, 2, 8], what is the element guaranteed to be in its final sorted position?',
    options: ['5', '8', '1', '2'],
    correct: 1,
    explanation: 'Bubble Sort bubbles the largest unsorted element to the rightmost position on each pass. Here, 8 bubbles to the end.'
  },
  {
    id: 2,
    title: 'Dijkstra Shortest Path Greedy Choice',
    question: 'In Dijkstra algorithm, which node is extracted next from the priority queue?',
    options: [
      'The node with the highest vertex degree',
      'The node with the smallest tentative distance from source',
      'The most recently added adjacent neighbor node',
      'The node with the highest weight edge'
    ],
    correct: 1,
    explanation: 'Dijkstra greedily picks the unvisited node with the smallest tentative distance from the source.'
  },
  {
    id: 3,
    title: 'QuickSort Partition Pivot',
    question: 'What is the average time complexity of QuickSort?',
    options: ['O(N²)', 'O(N log N)', 'O(N)', 'O(log N)'],
    correct: 1,
    explanation: 'QuickSort runs in O(N log N) average time due to recursive divide-and-conquer partitioning.'
  },
  {
    id: 4,
    title: 'Tree Traversal Sequence',
    question: 'Which tree traversal visits nodes in the order: Left Subtree → Root → Right Subtree?',
    options: ['Pre-Order', 'In-Order', 'Post-Order', 'Level-Order'],
    correct: 1,
    explanation: 'In-Order traversal processes Left child, current Root node, then Right child.'
  },
  {
    id: 5,
    title: 'Heap Sort Structure',
    question: 'In a Max Heap represented as an array, what property must every parent node at index i satisfy for children at 2i+1 and 2i+2?',
    options: [
      'A[i] >= A[2i+1] and A[i] >= A[2i+2]',
      'A[i] <= A[2i+1] and A[i] <= A[2i+2]',
      'A[i] == A[2i+1] + A[2i+2]',
      'A[i] is always prime'
    ],
    correct: 0,
    explanation: 'Max Heap property mandates that every parent element must be greater than or equal to its child nodes.'
  }
];

const QuizPage = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState({});

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (index) => {
    if (selectedOption !== null) return; // Prevent changing answer once picked

    setSelectedOption(index);
    const isCorrect = index === currentQ.correct;

    setAnswers(prev => ({ ...prev, [currentIdx]: index }));

    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(st => st + 1);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(c => c + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setStreak(0);
    setIsFinished(false);
    setAnswers({});
  };

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-white font-sans selection:bg-purple-500/30 flex flex-col">
      {/* Ambient Background */}
      <div className="bg-ambient"></div>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 relative z-10">
        
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1.5 rounded-full text-xs font-semibold mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>CHALLENGE & QUIZ MODE</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Algorithm Mastery Quiz</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
              <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Streak: {streak}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800/60 border border-white/10 rounded-full h-2.5 mb-8 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
          />
        </div>

        {!isFinished ? (
          <div className="glass-card border border-white/10 dark:border-purple-500/20 p-8 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-4 font-mono font-bold">
              <span>Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}</span>
              <span className="text-purple-400">{currentQ.title}</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Options List */}
            <div className="space-y-3 mb-8">
              {currentQ.options.map((opt, idx) => {
                const isPicked = selectedOption === idx;
                const isCorrect = idx === currentQ.correct;
                let btnStyle = "glass-card text-slate-300 border-white/10 hover:border-purple-500/40";

                if (selectedOption !== null) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20";
                  } else if (isPicked) {
                    btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/20";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={selectedOption !== null}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {selectedOption !== null && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {selectedOption !== null && isPicked && !isCorrect && <XCircle className="w-5 h-5 text-rose-400" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation box when option selected */}
            {selectedOption !== null && (
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-slate-300 mb-6 leading-relaxed">
                <strong className="text-purple-400 block mb-1">Explanation:</strong>
                {currentQ.explanation}
              </div>
            )}

            {/* Next Button */}
            {selectedOption !== null && (
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="btn-premium px-6 py-3 text-xs flex items-center gap-2"
                >
                  <span>{currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'See Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card border border-purple-500/30 p-10 rounded-3xl text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 mx-auto flex items-center justify-center mb-6">
              <Award className="w-8 h-8" />
            </div>

            <h2 className="text-3xl font-extrabold mb-2">Quiz Completed!</h2>
            <p className="text-sm text-slate-400 mb-6">
              You scored <strong className="text-purple-400 text-xl">{score}</strong> out of <strong className="text-white text-xl">{QUIZ_QUESTIONS.length}</strong>!
            </p>

            <button
              onClick={handleRestart}
              className="btn-premium px-8 py-3 text-sm inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Quiz</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizPage;
