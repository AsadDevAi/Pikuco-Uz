import React, { useState, useCallback } from 'react';
import { TournamentContent, TournamentItem } from '../../../types';
import { Swords, Trophy, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TournamentPlayerProps {
  content: TournamentContent;
  onComplete: (winnerId: string) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(items: TournamentItem[]): TournamentItem[][] {
  const pairs: TournamentItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    if (i + 1 < items.length) {
      pairs.push([items[i], items[i + 1]]);
    }
  }
  return pairs;
}

export default function TournamentPlayer({ content, onComplete }: TournamentPlayerProps) {
  const [items] = useState(() => shuffleArray(content.items));
  const [round, setRound] = useState<TournamentItem[][]>(() => buildRound(shuffleArray(content.items)));
  const [pairIdx, setPairIdx] = useState(0);
  const [winners, setWinners] = useState<TournamentItem[]>([]);
  const [roundNum, setRoundNum] = useState(1);
  const [champion, setChampion] = useState<TournamentItem | null>(null);

  const totalPairs = round.length;
  const currentPair = round[pairIdx];
  const progress = ((pairIdx) / totalPairs) * 100;

  const handlePick = useCallback((picked: TournamentItem) => {
    const newWinners = [...winners, picked];
    const newPairIdx = pairIdx + 1;

    if (newPairIdx >= round.length) {
      if (newWinners.length === 1) {
        setChampion(newWinners[0]);
        onComplete(newWinners[0].id);
      } else {
        const nextRound = buildRound(shuffleArray(newWinners));
        setRound(nextRound);
        setWinners([]);
        setPairIdx(0);
        setRoundNum(roundNum + 1);
      }
    } else {
      setWinners(newWinners);
      setPairIdx(newPairIdx);
    }
  }, [winners, pairIdx, round, roundNum, onComplete]);

  if (champion) {
    return (
      <div className="max-w-md mx-auto text-center">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-primary mb-4">G'olib!</h2>
        <div className="card p-6">
          {champion.mediaType === 'image' ? (
            <img src={champion.mediaUrl} alt={champion.title} className="w-full rounded-xl mb-4 object-cover aspect-square" />
          ) : (
            <video src={champion.mediaUrl} className="w-full rounded-xl mb-4" controls />
          )}
          <p className="font-semibold text-lg text-primary">{champion.title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Swords className="w-4 h-4" />
          {roundNum === 1 ? 'Birinchi bosqich' : roundNum === 2 ? 'Yarimfinal' : `${roundNum}-bosqich`} — {pairIdx + 1}/{totalPairs}
        </div>
        <h2 className="text-xl font-bold text-primary">Qaysi biri yaxshiroq?</h2>
        <div className="h-2 bg-[rgb(var(--border))] rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {currentPair.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => handlePick(item)}
            className="group card overflow-hidden hover:-translate-y-2 hover:shadow-[var(--shadow-elevated)] transition-all duration-300 text-left"
          >
            <div className="relative aspect-square overflow-hidden bg-[rgb(var(--bg-secondary))]">
              {item.mediaType === 'image' ? (
                <img
                  src={item.mediaUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <video src={item.mediaUrl} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <span className="text-white font-bold text-sm">Tanlash</span>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="font-medium text-sm text-primary truncate">{item.title}</span>
              <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary-500 transition-colors flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>

      <div className="text-center mt-4">
        <p className="text-xs text-muted">Yaxshirog'ini tanlang. G'olib keyingi bosqichga o'tadi.</p>
      </div>
    </div>
  );
}
