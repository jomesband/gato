import React, { useState, useEffect } from 'react';
import { Cat, Activity } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // Using simple math random fallback if uuid not available, but usually we'd add the package. Since no package manager, I'll use a helper.

import { WeightEntry } from './types';
import WeightForm from './components/WeightForm';
import WeightChart from './components/WeightChart';
import HistoryList from './components/HistoryList';
import InsightCard from './components/InsightCard';

// Simple UUID generator since we don't have the library installed in this environment representation
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [entries, setEntries] = useState<WeightEntry[]>(() => {
    try {
      const saved = localStorage.getItem('cat_weight_entries');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load data", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cat_weight_entries', JSON.stringify(entries));
  }, [entries]);

  const handleAddEntry = (newEntry: Omit<WeightEntry, 'id'>) => {
    // Check if entry for date exists, if so overwrite? Or just add. Let's add.
    const entry: WeightEntry = { ...newEntry, id: generateId() };
    setEntries(prev => [...prev, entry]);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Tem a certeza que deseja apagar este registo?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  // Calculate current stats
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const currentWeight = sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1].weight : 0;
  const startingWeight = sortedEntries.length > 0 ? sortedEntries[0].weight : 0;
  const totalChange = currentWeight - startingWeight;

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-xl">
              <Cat className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">GatoFit</h1>
          </div>
          <div className="text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
             {entries.length} registos
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        
        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Peso Atual</p>
             <p className="text-2xl font-bold text-gray-900">
               {currentWeight > 0 ? `${currentWeight.toFixed(2)} kg` : '--'}
             </p>
           </div>
           
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mudança Total</p>
             <div className={`flex items-center gap-2 text-2xl font-bold ${totalChange > 0 ? 'text-rose-500' : totalChange < 0 ? 'text-teal-500' : 'text-gray-900'}`}>
                {Math.abs(totalChange) > 0 && (totalChange > 0 ? '+' : '-')}
                {Math.abs(totalChange).toFixed(2)} kg
             </div>
           </div>

           <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hidden md:block">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Estado</p>
              <div className="flex items-center gap-2">
                 <Activity className="w-5 h-5 text-indigo-500" />
                 <span className="text-lg font-medium text-gray-700">A monitorizar</span>
              </div>
           </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Charts and Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <WeightChart data={entries} />
            <InsightCard entries={entries} />
          </div>

          {/* Right Column: Actions and List */}
          <div className="space-y-6">
            <WeightForm onAdd={handleAddEntry} />
            <HistoryList entries={entries} onDelete={handleDeleteEntry} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
