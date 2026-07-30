import React, { useState } from 'react';
import { TreeContent, TreeNode } from '../../../types';
import { cn } from '../../../lib/utils';
import { GitBranch, ChevronRight } from 'lucide-react';

interface TreePlayerProps {
  content: TreeContent;
  onComplete: (endingNodeId: string, path: string[]) => void;
}

export default function TreePlayer({ content, onComplete }: TreePlayerProps) {
  const startNode = content.nodes.find((n) => n.id === content.startNodeId) || content.nodes[0];
  const [currentNode, setCurrentNode] = useState<TreeNode>(startNode);
  const [path, setPath] = useState<string[]>([startNode.id]);
  const [ended, setEnded] = useState(false);

  const handleChoice = (nextNodeId: string | null) => {
    if (!nextNodeId) {
      setEnded(true);
      onComplete(currentNode.id, path);
      return;
    }
    const nextNode = content.nodes.find((n) => n.id === nextNodeId);
    if (!nextNode) return;

    const newPath = [...path, nextNode.id];
    setPath(newPath);
    setCurrentNode(nextNode);

    if (nextNode.isEnding) {
      setEnded(true);
      onComplete(nextNode.id, newPath);
    }
  };

  if (ended) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <GitBranch className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-primary mb-2">Yakun!</h2>
        <div className="card p-6">
          {currentNode.image && (
            <img src={currentNode.image} alt="Yakun rasmi" className="w-full rounded-xl mb-4 object-cover max-h-48" />
          )}
          <p className="text-primary">{currentNode.text}</p>
          <p className="text-sm text-muted mt-3">{path.length} ta qadam bosib o'tdingiz</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-secondary">
          <GitBranch className="w-4 h-4" />
          <span>{path.length} ta qadam</span>
        </div>
      </div>

      <div className="card p-6 mb-4">
        {currentNode.image && (
          <img src={currentNode.image} alt="Tugun rasmi" className="w-full rounded-xl mb-4 object-cover max-h-64" />
        )}
        <p className="text-lg font-medium text-primary leading-relaxed">{currentNode.text}</p>
      </div>

      <div className="space-y-3">
        {currentNode.choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleChoice(choice.nextNodeId)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 group',
              'border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] hover:border-green-500 hover:bg-green-500/5'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500 group-hover:border-green-500 transition-all">
              <span className="text-xs font-bold text-green-600 group-hover:text-white">{idx + 1}</span>
            </div>
            <span className="flex-1 text-sm font-medium text-primary">{choice.text}</span>
            <ChevronRight className="w-4 h-4 text-muted group-hover:text-green-500 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
