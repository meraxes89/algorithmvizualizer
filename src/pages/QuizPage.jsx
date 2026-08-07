import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, Sparkles, RefreshCw, Flame, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import Navbar from '../components/Navbar';

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
      'A[i] < A[2i+1]'
    ],
    correct: 0,
    explanation: 'In a Max Heap, every parent node must be greater than or equal to both of its children.'
  }
];

const QuizPage = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (idx) => {
    if (showResult) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQ.correct;
    setShowResult(true);

    if (isCorrect) {
      setScore(prev => prev + 100 + streak * 20);
      setStreak(prev => prev + 1);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setQuizFinished(true);
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setStreak(0);
    setShowResult(false);
    setQuizFinished(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/60 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Award className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Algorithm Quiz & Challenge
              </h1>
              <p className="text-xs text-slate-400">Test your mastery of data structures and step predictions</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/60 px-4 py-2 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-sm">
              <Flame className="w-4 h-4 text-amber-500 animate-bounce" /> {streak} Streak
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div className="text-purple-400 font-extrabold text-sm font-mono">
              Score: {score}
            </div>
          </div>
        </div>

        {/* Quiz Body */}
        {!quizFinished ? (
          <div className="flex flex-col bg-slate-800/70 border border-slate-700/60 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            {/* Progress */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-4">
              <span>Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}</span>
              <span className="px-2.5 py-1 rounded-full bg-slate-700 text-slate-200 font-bold">{currentQ.title}</span>
            </div>

            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug mb-6">
              {currentQ.question}
            </h2>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correct;

                let btnStyle = 'bg-slate-900/60 border-slate-700 hover:border-purple-500/50 text-slate-200';
                if (showResult) {
                  if (isCorrect) btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                  else if (isSelected) btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                  else btnStyle = 'bg-slate-900/30 border-slate-800 opacity-50';
                } else if (isSelected) {
                  btnStyle = 'bg-purple-600/30 border-purple-500 text-purple-200 ring-2 ring-purple-500/30';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`flex items-center justify-between p-4 rounded-2xl border text-left text-sm font-medium transition-all ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {showResult && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 mb-6 text-xs text-slate-300 leading-relaxed animate-in fade-in">
                <span className="font-extrabold text-purple-400 block mb-1">Explanation:</span>
                {currentQ.explanation}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end">
              {!showResult ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedOption === null}
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 transition-all"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg transition-all"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-800/70 border border-slate-700/60 rounded-3xl text-center backdrop-blur-xl shadow-2xl">
            <div className="p-4 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 mb-4 animate-bounce">
              <Trophy className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-100 mb-2">Quiz Completed!</h2>
            <p className="text-slate-400 text-sm mb-6">You scored <span className="text-purple-400 font-extrabold font-mono text-lg">{score}</span> points!</p>
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Play Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizPage;
