
import React, { useState } from 'react';
import { calculateDailyEntry } from '../utils/calculations';
import { DailyEntry, AppConfig } from '../types';

interface QuickLaunchProps {
  onAdd: (entry: DailyEntry) => void;
  existingEntries: DailyEntry[];
  config: AppConfig;
}

const QuickLaunch: React.FC<QuickLaunchProps> = ({ onAdd, existingEntries, config }) => {
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); 
  };

  const [amount, setAmount] = useState<string>('6'); 
  const [storeName, setStoreName] = useState<string>('');
  const [time, setTime] = useState<string>(getCurrentTime());
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const recentStores = Array.from(new Set(existingEntries.filter(e => e.grossAmount > 0).map(e => e.storeName).reverse())).slice(0, 6);
  const suggestionAmounts = [6, 7, 8, 10, 15];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const newEntry = calculateDailyEntry(numAmount, date, time, storeName, config);
    onAdd(newEntry);
    
    setAmount('6');
    setStoreName('');
    setTime(getCurrentTime());
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Lançamento Rápido
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Loja / Estabelecimento</label>
            <input
              type="text"
              list="stores-list"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Ex: App, Posto X, Cliente..."
            />
            <datalist id="stores-list">
              {recentStores.map(store => <option key={store} value={store} />)}
            </datalist>
            <div className="flex flex-wrap gap-1 mt-2">
              {recentStores.map(store => (
                <button
                  key={store}
                  type="button"
                  onClick={() => setStoreName(store)}
                  className={`text-[10px] px-2 py-0.5 rounded-full transition ${storeName === store ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600'}`}
                >
                  {store}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor Bruto (R$)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="0,00"
              required
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {suggestionAmounts.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className={`text-[10px] px-2 py-0.5 rounded-full transition ${amount === val.toString() ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600'}`}
                >
                  R$ {val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" required />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" required />
          </div>
        </div>

        <button type="submit" className="w-full md:w-auto bg-indigo-600 text-white font-bold py-3 px-12 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200">
          Salvar Registro
        </button>
      </form>
    </div>
  );
};

export default QuickLaunch;
