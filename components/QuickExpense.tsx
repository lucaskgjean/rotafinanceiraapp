
import React, { useState } from 'react';
import { calculateManualExpense } from '../utils/calculations';
import { DailyEntry } from '../types';

interface QuickExpenseProps {
  onAdd: (entry: DailyEntry) => void;
}

const QuickExpense: React.FC<QuickExpenseProps> = ({ onAdd }) => {
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<'fuel' | 'food' | 'maintenance'>('fuel');
  const [time, setTime] = useState<string>(getCurrentTime());
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [kmAtMaintenance, setKmAtMaintenance] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'pix' | 'debito'>('money');

  const suggestionAmounts = [20, 50, 100, 150];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const numKm = kmAtMaintenance ? parseFloat(kmAtMaintenance) : undefined;

    const newEntry = calculateManualExpense(numAmount, category, date, time, description, numKm, paymentMethod);
    onAdd(newEntry);
    
    setAmount('');
    setDescription('');
    setKmAtMaintenance('');
    setTime(getCurrentTime());
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-md border border-red-100">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Lançar gasto extra
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Categoria */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria do gasto</label>
            <div className="grid grid-cols-3 gap-2">
                <button 
                    type="button" 
                    onClick={() => setCategory('fuel')}
                    className={`py-2 text-[10px] font-bold rounded-lg border transition ${category === 'fuel' ? 'bg-red-500 border-red-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                >
                    Combust.
                </button>
                <button 
                    type="button" 
                    onClick={() => setCategory('food')}
                    className={`py-2 text-[10px] font-bold rounded-lg border transition ${category === 'food' ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                >
                    Aliment.
                </button>
                <button 
                    type="button" 
                    onClick={() => setCategory('maintenance')}
                    className={`py-2 text-[10px] font-bold rounded-lg border transition ${category === 'maintenance' ? 'bg-blue-500 border-blue-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                >
                    Manut.
                </button>
            </div>
          </div>

          {/* Valor */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor do gasto (R$)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition font-bold"
              placeholder="0,00"
              required
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {suggestionAmounts.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 transition font-bold"
                >
                  R$ {val}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition font-bold"
              placeholder="Ex: Troca de óleo, Lanche..."
            />
          </div>

          {/* Forma de Pagamento */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Forma de pagamento</label>
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
                    className={`py-2 text-[10px] font-bold rounded-lg border transition ${paymentMethod === method.id ? 'bg-slate-800 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                  >
                    {method.label}
                  </button>
                ))}
            </div>
          </div>

          {/* KM (Apenas para Manutenção) */}
          {category === 'maintenance' && (
            <div className="flex-1 animate-in fade-in zoom-in-95 duration-300">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">KM atual</label>
              <input
                type="number"
                value={kmAtMaintenance}
                onChange={(e) => setKmAtMaintenance(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-bold"
                placeholder="Ex: 45000"
                required
              />
            </div>
          )}

          {/* Data/Hora */}
          <div className="flex gap-2">
            <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-3 text-xs focus:outline-none font-bold" required />
            </div>
            <div className="w-20">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-3 text-xs focus:outline-none font-bold" required />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full md:w-auto bg-red-500 text-white font-bold py-3 px-12 rounded-lg hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-100"
        >
          Salvar gasto
        </button>
      </form>
    </div>
  );
};

export default QuickExpense;
