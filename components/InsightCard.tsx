import React, { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, HelpCircle, Loader2, RefreshCw } from 'lucide-react';
import { WeightEntry, AnalysisResult } from '../types';
import { analyzeWeightTrend } from '../services/geminiService';

interface InsightCardProps {
  entries: WeightEntry[];
}

const InsightCard: React.FC<InsightCardProps> = ({ entries }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastAnalyzedCount, setLastAnalyzedCount] = useState(0);

  const handleAnalysis = async () => {
    if (entries.length < 2) return;
    
    setLoading(true);
    const result = await analyzeWeightTrend(entries);
    setAnalysis(result);
    setLastAnalyzedCount(entries.length);
    setLoading(false);
  };

  // Auto-analyze on mount if we have data, but prevent spamming API on every render
  // Only auto-trigger if data changed significantly or first load
  useEffect(() => {
    if (entries.length >= 2 && entries.length !== lastAnalyzedCount && !analysis) {
       // Optional: Auto analyze on load. For now, let's make it manual or on-load if empty
       handleAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]); 

  if (entries.length < 2) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-24 h-24 text-indigo-600" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            IA Veterinária (Gemini)
          </h3>
          <button 
            onClick={handleAnalysis} 
            disabled={loading}
            className="text-indigo-400 hover:text-indigo-600 p-1 transition-colors"
            title="Atualizar análise"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-indigo-700 py-4">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">A analisar a saúde do seu gato...</span>
          </div>
        ) : analysis ? (
          <div className="space-y-3">
             <div className="flex items-start gap-3">
                {analysis.status === 'healthy' && <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 shrink-0" />}
                {analysis.status === 'warning' && <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5 shrink-0" />}
                {analysis.status === 'unknown' && <HelpCircle className="w-6 h-6 text-gray-400 mt-0.5 shrink-0" />}
                
                <div>
                  <p className="text-indigo-900 font-medium leading-tight mb-1">{analysis.message}</p>
                  <p className="text-indigo-700 text-sm bg-white/60 p-2 rounded-lg mt-2 inline-block">
                    💡 {analysis.recommendation}
                  </p>
                </div>
             </div>
          </div>
        ) : (
          <button 
            onClick={handleAnalysis}
            className="text-sm text-indigo-600 underline decoration-indigo-300 hover:text-indigo-800"
          >
            Toque para analisar o histórico
          </button>
        )}
      </div>
    </div>
  );
};

export default InsightCard;
