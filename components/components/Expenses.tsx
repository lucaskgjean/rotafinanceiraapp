
import React from 'react';
import { DailyEntry, AppConfig } from '../types';
import { formatCurrency, getWeeklyGroupedSummaries } from '../utils/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ExpensesProps {
  entries: DailyEntry[];
  config: AppConfig;
  onEdit: (entry: DailyEntry) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ entries, config, onEdit }) => {
  const incomeEntries = entries.filter(e => e.grossAmount > 0);
  const manualExpenseEntries = entries.filter(e => e.grossAmount === 0);
  const weeklyExpenseGroups = getWeeklyGroupedSummaries(entries);

  const reserves = {
    fuel: incomeEntries.reduce((acc, curr) => acc + curr.fuel, 0),
    food: incomeEntries.reduce((acc, curr) => acc + curr.food, 0),
    maintenance: incomeEntries.reduce((acc, curr) => acc + curr.maintenance, 0),
  };

  const actualSpent = {
    fuel: manualExpenseEntries.reduce((acc, curr) => acc + curr.fuel, 0),
    food: manualExpenseEntries.reduce((acc, curr) => acc + curr.food, 0),
    maintenance: manualExpenseEntries.reduce((acc, curr) => acc + curr.maintenance, 0),
  };

  const balances = {
    fuel: reserves.fuel - actualSpent.fuel,
    food: reserves.food - actualSpent.food,
    maintenance: reserves.maintenance - actualSpent.maintenance,
    total: (reserves.fuel + reserves.food + reserves.maintenance) - (actualSpent.fuel + actualSpent.food + actualSpent.maintenance)
  };

  const totalReservedPerc = (config.percFuel + config.percFood + config.percMaintenance) * 100;

  // ICONES CORRETOS POR CATEGORIA
  const categories = [
    { 
      name: 'Combustível', 
      key: 'fuel', 
      color: '#ef4444', 
      allocated: reserves.fuel, 
      spent: actualSpent.fuel, 
      bal: balances.fuel,
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4v16a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1h-2.5V3a1 1 0 00-1-1h-2a1 1 0 00-1 1v2H9V4a1 1 0 00-1-1H6a1 1 0 00-1 1v1h-.5a1 1 0 00-1 1v15m14.5-9V7a2 2 0 012-2h1a2 2 0 012 2v10a2 2 0 01-2 2h-1a2 2 0 01-2-2" />
    },
    { 
      name: 'Alimentação', 
      key: 'food', 
      color: '#f59e0b', 
      allocated: reserves.food, 
      spent: actualSpent.food, 
      bal: balances.food,
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 2v7c0 1.1.9 2 2 2h4v10a1 1 0 001 1h2a1 1 0 001-1V11h4c1.1 0 2-.9 2-2V2M9 2v4M12 2v4M15 2v4" />
    },
    { 
      name: 'Manutenção', 
      key: 'maintenance', 
      color: '#3b82f6', 
      allocated: reserves.maintenance, 
      spent: actualSpent.maintenance, 
      bal: balances.maintenance,
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.77 3.77z" />
    },
  ];

  return (
    <div className="space-y-8">
      {/* Saldo das Reservas */}
      <div className={`bg-gradient-to-br ${balances.total >= 0 ? 'from-emerald-600 to-emerald-800' : 'from-rose-600 to-rose-800'} rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-500`}>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Saldo Total das Reservas ({totalReservedPerc.toFixed(0)}%)</h2>
            <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
              Acumulado
            </div>
          </div>
          <div className="text-5xl font-black tracking-tighter mb-8">{formatCurrency(balances.total)}</div>
          
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60 block mb-1">Total Reservado Bruto</span>
              <p className="text-xl font-black">{formatCurrency(reserves.fuel + reserves.food + reserves.maintenance)}</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60 block mb-1">Total Gasto Real</span>
              <p className="text-xl font-black text-white/90">-{formatCurrency(actualSpent.fuel + actualSpent.food + actualSpent.maintenance)}</p>
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 scale-150">
           <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.82v-1.91c-1.64-.32-3.13-1.21-4.14-2.48l1.45-1.45c.78.91 1.9 1.54 3.16 1.76V13c-2.32-.57-4-2.22-4-4.5 0-2.47 1.91-4.5 4.5-4.5V2h2.82v2.09c1.64.32 3.13 1.21 4.14 2.48l-1.45 1.45c-.78-.91-1.9-1.54-3.16-1.76V11c2.32.57 4 2.22 4 4.5 0 2.47-1.91 4.5-4.5 4.5z" /></svg>
        </div>
      </div>

      {/* Cards de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map(cat => {
          const usagePercent = cat.allocated > 0 ? Math.min(100, (cat.spent / cat.allocated) * 100) : 0;
          return (
            <div key={cat.name} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{cat.icon}</svg>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{cat.name}</span>
                  <p className={`text-xl font-black tracking-tighter mt-1 ${cat.bal >= 0 ? 'text-slate-800' : 'text-rose-500'}`}>{formatCurrency(cat.bal)}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                  <span className="text-slate-400">Gasto Real: {formatCurrency(cat.spent)}</span>
                  <span className={`${usagePercent > 80 ? 'text-rose-500' : 'text-slate-500'}`}>{usagePercent.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full transition-all duration-700" style={{ width: `${usagePercent}%`, backgroundColor: cat.color }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fechamento Semanal com Gráfico */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-slate-800 px-2 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
          Balanço Semanal de Despesas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {weeklyExpenseGroups.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
               <p className="text-slate-400 text-sm font-medium italic">Aguardando dados para o primeiro fechamento...</p>
            </div>
          ) : (
            weeklyExpenseGroups.map((week, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Período</span>
                      <p className="text-sm font-black text-slate-700">
                         {week.startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} — {week.endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mb-1">Custo Total</span>
                      <p className="text-lg font-black text-rose-600">{formatCurrency(week.spentFuel + week.spentFood + week.spentMaintenance)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                     <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100/50">
                        <span className="text-[9px] font-black text-red-400 uppercase block mb-1 tracking-tighter">Comb.</span>
                        <span className="text-xs font-black text-red-700">{formatCurrency(week.spentFuel)}</span>
                     </div>
                     <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                        <span className="text-[9px] font-black text-amber-500 uppercase block mb-1 tracking-tighter">Alim.</span>
                        <span className="text-xs font-black text-amber-700">{formatCurrency(week.spentFood)}</span>
                     </div>
                     <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                        <span className="text-[9px] font-black text-blue-400 uppercase block mb-1 tracking-tighter">Manut.</span>
                        <span className="text-xs font-black text-blue-700">{formatCurrency(week.spentMaintenance)}</span>
                     </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;
