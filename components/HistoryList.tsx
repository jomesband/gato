import React from 'react';
import { Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { WeightEntry } from '../types';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

interface HistoryListProps {
  entries: WeightEntry[];
  onDelete: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ entries, onDelete }) => {
  // Sort descending by date
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-h-[500px]">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-bold text-gray-700">Histórico</h3>
      </div>
      
      <div className="overflow-y-auto flex-1 p-2">
        {sortedEntries.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Nenhum registo ainda.</p>
        ) : (
          <ul className="space-y-2">
            {sortedEntries.map((entry, index) => {
              // Calculate diff with next item (which is chronologically previous because list is desc)
              const prevEntry = sortedEntries[index + 1];
              let diff = 0;
              let TrendIcon = Minus;
              let trendColor = "text-gray-400";
              
              if (prevEntry) {
                diff = entry.weight - prevEntry.weight;
                if (diff > 0) { TrendIcon = TrendingUp; trendColor = "text-rose-500"; }
                if (diff < 0) { TrendIcon = TrendingDown; trendColor = "text-teal-500"; }
              }

              return (
                <li key={entry.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">
                      {format(parseISO(entry.date), "d 'de' MMM, yyyy", { locale: pt })}
                    </span>
                    <span className="text-xs text-gray-500">{entry.note}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{entry.weight.toFixed(2)} kg</div>
                      {prevEntry && (
                        <div className={`text-xs flex items-center justify-end gap-1 ${trendColor}`}>
                          <TrendIcon className="w-3 h-3" />
                          {Math.abs(diff).toFixed(2)}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1"
                      title="Apagar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HistoryList;
