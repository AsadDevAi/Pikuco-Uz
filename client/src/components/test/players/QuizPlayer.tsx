import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { QuizContent } from '../../../types';
import { cn } from '../../../lib/utils';

interface QuizPlayerProps {
  content: QuizContent;
  onComplete: (answers: number[]) => void;
}

export default function QuizPlayer({ content, onComplete }: QuizPlayerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const question = content.questions[currentIdx];
  const progress = ((currentIdx) / content.questions.length) * 100;

  const handleSelect = (optionIdx: number) => {
    if (revealed) return;
    setSelectedOption(optionIdx);
    setRevealed(true);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selectedOption ?? -1];
    if (currentIdx + 1 >= content.questions.length) {
      onComplete(newAnswers);
    } else {
      setAnswers(newAnswers);
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setRevealed(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-secondary mb-2">
          <span>Savol {currentIdx + 1} / {content.questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-[rgb(var(--border))] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="card p-6 mb-4">
        {question.image && (
          <img src={question.image} alt="Savol rasmi" className="w-full rounded-xl mb-4 object-cover max-h-48" />
        )}
        <h2 className="text-lg font-semibold text-primary mb-6">{question.text}</h2>

        <div className="space-y-3">
          {question.options.map((option, idx) => {
            let optionClass = 'border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] hover:border-primary-400 hover:bg-primary-500/5';
            if (revealed) {
              if (option.isCorrect) {
                optionClass = 'border-green-500 bg-green-50 dark:bg-green-950/30';
              } else if (selectedOption === idx && !option.isCorrect) {
                optionClass = 'border-red-500 bg-red-50 dark:bg-red-950/30';
              } else {
                optionClass = 'border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] opacity-60';
              }
            } else if (selectedOption === idx) {
              optionClass = 'border-primary-500 bg-primary-500/10';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={revealed}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200',
                  optionClass,
                  !revealed && 'cursor-pointer'
                )}
              >
                <span className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2',
                  revealed && option.isCorrect ? 'border-green-500 bg-green-500 text-white' :
                  revealed && selectedOption === idx && !option.isCorrect ? 'border-red-500 bg-red-500 text-white' :
                  selectedOption === idx ? 'border-primary-500 bg-primary-500 text-white' :
                  'border-[rgb(var(--border))] text-secondary'
                )}>
                  {revealed && option.isCorrect ? <CheckCircle className="w-4 h-4" /> :
                   revealed && selectedOption === idx && !option.isCorrect ? <XCircle className="w-4 h-4" /> :
                   String.fromCharCode(65 + idx)}
                </span>
                {option.image && (
                  <img src={option.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-primary">{option.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {revealed && (
        <button
          onClick={handleNext}
          className="btn btn-primary btn-lg w-full"
        >
          {currentIdx + 1 >= content.questions.length ? 'Natijani ko\'rish' : 'Keyingi savol'}
        </button>
      )}
    </div>
  );
}
