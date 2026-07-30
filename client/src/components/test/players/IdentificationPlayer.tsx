import React, { useState } from 'react';
import { IdentificationContent } from '../../../types';
import { cn } from '../../../lib/utils';

interface IdentificationPlayerProps {
  content: IdentificationContent;
  onComplete: (answers: number[]) => void;
}

export default function IdentificationPlayer({ content, onComplete }: IdentificationPlayerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const question = content.questions[currentIdx];
  const progress = (currentIdx / content.questions.length) * 100;

  const handleSelect = (optionIdx: number) => {
    setSelectedOption(optionIdx);
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    const newAnswers = [...answers, selectedOption];
    if (currentIdx + 1 >= content.questions.length) {
      onComplete(newAnswers);
    } else {
      setAnswers(newAnswers);
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
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
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
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
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200',
                selectedOption === idx
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] hover:border-purple-400 hover:bg-purple-500/5'
              )}
            >
              <span className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 transition-all',
                selectedOption === idx ? 'border-purple-500 bg-purple-500 text-white' : 'border-[rgb(var(--border))] text-secondary'
              )}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-sm font-medium text-primary">{option.text}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={selectedOption === null}
        className="btn btn-lg w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50"
      >
        {currentIdx + 1 >= content.questions.length ? 'Natijani ko\'rish' : 'Keyingi savol'}
      </button>
    </div>
  );
}
