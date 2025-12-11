export interface WeightEntry {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  weight: number;
  note?: string;
}

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export interface AnalysisResult {
  status: 'healthy' | 'warning' | 'unknown';
  message: string;
  recommendation: string;
}
