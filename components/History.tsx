
import React from 'react';
import { TranslationHistoryItem } from '../types';
import { ReuseIcon, TrashIcon, SwapIcon } from './Icons';

interface HistoryItemProps {
  item: TranslationHistoryItem;
  onReuse: (item: TranslationHistoryItem) => void;
  onDelete: (id: number) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onReuse, onDelete }) => {
  return (
    <li className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 group">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{item.sourceLang.name}</span>
            <SwapIcon className="w-4 h-4 text-gray-500" />
            <span>{item.targetLang.name}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Tone: {item.tone.label}</div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={() => onReuse(item)}
                className="p-1.5 text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="Reuse translation"
                title="Reuse translation"
            >
                <ReuseIcon className="w-5 h-5" />
            </button>
            <button 
                onClick={() => onDelete(item.id)}
                className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                aria-label="Delete translation"
                title="Delete translation"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-gray-300 bg-gray-900/50 p-2 rounded-md whitespace-pre-wrap break-words">
            <span className="font-semibold text-indigo-400/80">Original: </span>
            {item.sourceText}
        </p>
        <p className="text-gray-200 bg-gray-900/50 p-2 rounded-md whitespace-pre-wrap break-words">
            <span className="font-semibold text-purple-400/80">Translated: </span>
            {item.translatedText}
        </p>
      </div>
    </li>
  );
};

interface HistoryListProps {
    history: TranslationHistoryItem[];
    onReuseItem: (item: TranslationHistoryItem) => void;
    onDeleteItem: (id: number) => void;
    onClearHistory: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onReuseItem, onDeleteItem, onClearHistory }) => {
    if (history.length === 0) {
        return null;
    }

    return (
        <section className="mt-8" aria-labelledby="history-heading">
            <div className="flex justify-between items-center mb-4">
                <h2 id="history-heading" className="text-2xl font-bold text-gray-300">Translation History</h2>
                <button
                    onClick={onClearHistory}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-red-800/50 hover:bg-red-700/50 border border-red-700/50 rounded-md transition-colors"
                >
                    Clear History
                </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                <ul className="space-y-4">
                    {history.map((item) => (
                        <HistoryItem 
                            key={item.id} 
                            item={item} 
                            onReuse={onReuseItem}
                            onDelete={onDeleteItem} 
                        />
                    ))}
                </ul>
            </div>
        </section>
    );
};
