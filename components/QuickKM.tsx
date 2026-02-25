
import React, { useState } from 'react';
import { DailyEntry, AppConfig } from '../types';
import { generateId } from '../utils/calculations';

interface QuickKMProps {
  onAdd: (entry: DailyEntry) => void;
  config: AppConfig;
}

const QuickKM: React.FC<QuickKMProps> = ({ onAdd, config }) => {
  const [kmDriven, setKmDriven] = useState<string>('');
  const [fuelPrice, setFuelPrice] = useState<string>(config.lastFuelPrice?.toString() || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numKm = parseFloat(kmDriven);
    if (isNaN(numKm) || numKm <= 0) return;

    const numFuelPrice = fuelPrice ? parseFloat(fuelPrice) : config.lastFuelPrice;

    const newEntry: DailyEntry = {
      id: generateId(),
      date,
      time: new Date().toTimeString().slice(0, 5),
      storeName: 'Fechamento de KM',
      grossAmount: 0,
      fuel: 0,
      food: 0,
      maintenance: 0,
      netAmount: 0,
      kmDriven: numKm,
      fuelPrice: numFuelPrice
    };

    onAdd(newEntry);
    setKmDriven('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        Fechamento de KM
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">KM Rodado no Dia</label>
            <input
              type="number"
              step="0.1"
              value={kmDriven}
              onChange={(e) => setKmDriven(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              placeholder="Ex: 120.5"
              required
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço da Gasolina (R$/L)</label>
            <input
              type="number"
              step="0.001"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              placeholder={config.lastFuelPrice?.toString() || "0.000"}
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition" 
              required 
            />
          </div>
        </div>

        <button type="submit" className="w-full md:w-auto bg-rose-500 text-white font-bold py-3 px-12 rounded-lg hover:bg-rose-600 active:scale-95 transition-all shadow-lg shadow-rose-200">
          Salvar Fechamento
        </button>
      </form>
    </div>
  );
};

export default QuickKM;
