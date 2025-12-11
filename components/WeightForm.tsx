import React, { useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { WeightEntry } from '../types';

interface WeightFormProps {
  onAdd: (entry: Omit<WeightEntry, 'id'>) => void;
}

const WeightForm: React.FC<WeightFormProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || parseFloat(weight) <= 0) {
      setError('Por favor, insira um peso válido.');
      return;
    }

    onAdd({
      date,
      weight: parseFloat(weight),
      note: note.trim() || undefined
    });

    // Reset and close
    setWeight('');
    setNote('');
    setError('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Registar Novo Peso
      </button>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl shadow-md border border-indigo-100 animate-fade-in-down">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Novo Registo</h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
          <input
            type="number"
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ex: 4.5"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex: Troca de ração..."
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Guardar
        </button>
      </form>
    </div>
  );
};

export default WeightForm;
