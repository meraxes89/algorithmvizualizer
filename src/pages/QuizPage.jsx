import React, { useState } from 'react';
import { CheckCircle2, XCircle, Award, RefreshCw, Flame, ArrowRight, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import PageShell from '../components/ui/PageShell';

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
    if (selectedOption !== null) return;

    setSelectedOption(index);
    const isCorrect = index === currentQ.correct;

    setAnswers((prev) => ({ ...prev, [currentIdx]: index }));

    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((c) => c + 1);
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
    <PageShell
      kicker={
        <>
          <Trophy className="w-3 h-3" />
          <span>Challenge & Quiz Mode</span>
        </>
      }
      title="Algorithm Mastery Quiz"
      subtitle="Complexity, patterns and edge cases — scored as you go."
      icon={Trophy}
      layoutKey="QUIZ"
      width="narrow"
      stage={false}
      actions={
        <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400">
          <Flame className="w-4 h-4" />
          <span>Streak: {streak}</span>
        </div>
      }
    >
      <div className="mb-8 h-2.5 w-full overflow-hidden rounded-full border border-line-subtle bg-line-subtle">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
        />
      </div>

      {!isFinished ? (
        <div className="glass-card p-8">
          <div className="mb-4 flex items-center justify-between text-xs font-mono font-bold text-ink-3">
            <span>Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}</span>
            <span className="text-accent">{currentQ.title}</span>
          </div>

          <h2 className="mb-6 text-xl font-bold leading-relaxed text-ink">
            {currentQ.question}
          </h2>

          <div className="mb-8 space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isPicked = selectedOption === idx;
              const isCorrect = idx === currentQ.correct;
              let btnStyle = 'border-line-subtle bg-paper-2/60 text-ink-2 hover:border-accent/40 hover:text-ink';

              if (selectedOption !== null) {
                if (isCorrect) {
                  btnStyle = 'border-emerald-500/60 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
                } else if (isPicked) {
                  btnStyle = 'border-rose-500/60 bg-rose-500/15 text-rose-700 dark:text-rose-300';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={selectedOption !== null}
                  onClick={() => handleSelectOption(idx)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left text-sm font-semibold transition-all ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {selectedOption !== null && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {selectedOption !== null && isPicked && !isCorrect && <XCircle className="w-5 h-5 text-rose-500" />}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <div className="mb-6 rounded-2xl border border-accent/25 bg-accent-soft p-4 text-xs leading-relaxed text-ink-2">
              <strong className="mb-1 block text-accent">Explanation:</strong>
              {currentQ.explanation}
            </div>
          )}

          {selectedOption !== null && (
            <div className="flex justify-end">
              <button onClick={handleNext} className="btn-premium flex items-center gap-2 px-6 py-3 text-xs">
                <span>{currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'See Results'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-accent">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="mb-2 font-display text-3xl font-bold text-ink">Quiz Completed</h2>
          <p className="mb-6 text-sm text-ink-2">
            You scored <strong className="text-xl text-accent">{score}</strong> out of{' '}
            <strong className="text-xl text-ink">{QUIZ_QUESTIONS.length}</strong>.
          </p>

          <button onClick={handleRestart} className="btn-premium inline-flex items-center gap-2 px-8 py-3 text-sm">
            <RefreshCw className="w-4 h-4" />
            <span>Retry Quiz</span>
          </button>
        </div>
      )}
    </PageShell>
  );
};

export default QuizPage;
