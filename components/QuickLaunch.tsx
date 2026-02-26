
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
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'pix' | 'debito'>('pix');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const recentStores = Array.from(new Set(existingEntries.filter(e => e.grossAmount > 0).map(e => e.storeName).reverse())).slice(0, 6);
  const suggestionAmounts = [6, 7, 8, 10, 15];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const newEntry = calculateDailyEntry(numAmount, date, time, storeName, config, undefined, undefined, paymentMethod);
    onAdd(newEntry);
    
    setAmount('6');
    setStoreName('');
    setTime(getCurrentTime());
    setShowAdvanced(false);
  };

  return (
    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          Lançamento rápido
        </h3>
        <button 
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
        >
          {showAdvanced ? 'Ocultar detalhes' : 'Mais opções'}
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Loja / Estabelecimento</label>
            <input
              type="text"
              list="stores-list"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold text-slate-700"
              placeholder="Ex: App, Posto X..."
            />
            <datalist id="stores-list">
              {recentStores.map(store => <option key={store} value={store} />)}
            </datalist>
          </div>

          <div className="flex-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Valor bruto (R$)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">R$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-black text-slate-700 text-lg"
                placeholder="0,00"
                required
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {suggestionAmounts.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className={`text-[10px] font-black px-3 py-1.5 rounded-full transition-all ${amount === val.toString() ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600'}`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Forma de pagamento</label>
            <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'debito', label: 'Débito' },
                  { id: 'money', label: 'Dinheiro' },
                  { id: 'pix', label: 'PIX' }
                ].map(method => (
                  <button 
                    key={method.id}
                    type="button" 
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${paymentMethod === method.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                  >
                    {method.label}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data do lançamento</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold text-slate-700" required />
            </div>

            <div className="flex-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Horário</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold text-slate-700" required />
            </div>
          </div>
        )}

        <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-100 uppercase text-xs tracking-[0.2em]">
          Confirmar lançamento
        </button>
      </form>
    </div>
  );
};

export default QuickLaunch;
