import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush
} from 'recharts';
import { format, subMonths, subYears, isAfter, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { WeightEntry, TimeRange } from '../types';
import { ZoomIn, Calendar } from 'lucide-react';

interface WeightChartProps {
  data: WeightEntry[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg">
        <p className="text-sm font-medium text-gray-600">
          {format(parseISO(label), "d 'de' MMMM, yyyy", { locale: pt })}
        </p>
        <p className="text-lg font-bold text-indigo-600">
          {payload[0].value.toFixed(2)} kg
        </p>
        {payload[0].payload.note && (
           <p className="text-xs text-gray-400 mt-1 italic max-w-[200px]">
             "{payload[0].payload.note}"
           </p>
        )}
      </div>
    );
  }
  return null;
};

const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  const [range, setRange] = useState<TimeRange>('ALL');

  // Sort data strictly by date before filtering
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const filteredData = useMemo(() => {
    if (range === 'ALL') return sortedData;

    const now = new Date();
    let startDate: Date;

    switch (range) {
      case '1M': startDate = subMonths(now, 1); break;
      case '3M': startDate = subMonths(now, 3); break;
      case '6M': startDate = subMonths(now, 6); break;
      case '1Y': startDate = subYears(now, 1); break;
      default: startDate = new Date(0);
    }

    return sortedData.filter(entry => isAfter(parseISO(entry.date), startDate));
  }, [sortedData, range]);

  // Calculate min and max for Y-axis domain to make the chart look dynamic
  const minWeight = Math.min(...filteredData.map(d => d.weight));
  const maxWeight = Math.max(...filteredData.map(d => d.weight));
  const yDomain = [Math.max(0, minWeight - 0.5), maxWeight + 0.5];

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400">
        <Calendar className="w-12 h-12 mb-2 opacity-50" />
        <p>Sem dados para mostrar.</p>
        <p className="text-sm">Adicione o primeiro peso!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <ZoomIn className="w-5 h-5 text-indigo-500" />
          Evolução do Peso
        </h2>
        
        <div className="flex bg-gray-100 p-1 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                range === r
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
            >
              {r === 'ALL' ? 'Tudo' : r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(parseISO(date), 'dd/MM')}
              stroke="#9ca3af"
              fontSize={12}
              tickMargin={10}
            />
            <YAxis 
              domain={yDomain} 
              stroke="#9ca3af" 
              fontSize={12}
              tickFormatter={(value) => `${value.toFixed(1)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="weight" 
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorWeight)" 
              animationDuration={1000}
            />
            {range === 'ALL' && filteredData.length > 5 && (
               <Brush 
                 dataKey="date" 
                 height={30} 
                 stroke="#818cf8" 
                 fill="#eff6ff"
                 tickFormatter={(date) => format(parseISO(date), 'dd/MM')}
               />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeightChart;
