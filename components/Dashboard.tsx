
import React from 'react';
import { DailyEntry, AppConfig } from '../types';
import { formatCurrency, getWeeklySummary, calculateFuelMetrics } from '../utils/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import QuickLaunch from './QuickLaunch';

interface DashboardProps {
  entries: DailyEntry[];
  config: AppConfig;
  onEdit: (entry: DailyEntry) => void;
  onDelete: (id: string) => void;
  onNavigate: (tab: any) => void;
  onAdd: (entry: DailyEntry) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ entries, config, onEdit, onDelete, onNavigate, onAdd }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const getStartOfWeek = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  const startOfWeek = getStartOfWeek(new Date());
  startOfWeek.setHours(0, 0, 0, 0);

  const todayEntries = entries.filter(e => e.date === todayStr);
  const monthEntries = entries.filter(e => e.date.startsWith(currentMonthStr));
  const weekEntries = entries.filter(e => {
    const entryDate = new Date(e.date + 'T12:00:00');
    return entryDate >= startOfWeek;
  });

  const todaySum = getWeeklySummary(todayEntries);
  const weekSum = getWeeklySummary(weekEntries);
  const monthSum = getWeeklySummary(monthEntries);
  const generalSum = getWeeklySummary(entries);

  const fuelMetrics = calculateFuelMetrics(entries);

  const goalPercent = Math.min(100, (todaySum.totalGross / config.dailyGoal) * 100);
  const isGoalReached = todaySum.totalGross >= config.dailyGoal;

  const pieData = [
    { name: `Combustível`, value: generalSum.totalFuel, color: '#ef4444' },
    { name: `Alimentação`, value: generalSum.totalFood, color: '#f59e0b' },
    { name: `Manutenção`, value: generalSum.totalMaintenance, color: '#3b82f6' },
    { name: `Líquido`, value: generalSum.totalNet, color: '#10b981' },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Lançamento Rápido */}
      <QuickLaunch onAdd={onAdd} existingEntries={entries} config={config} />

      {/* 2. Faturamento (dia, semana, mês) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Hoje', sum: todaySum, color: 'from-indigo-600 to-indigo-800' },
          { label: 'Semana', sum: weekSum, color: 'from-emerald-600 to-teal-800' },
          { label: 'Mês', sum: monthSum, color: 'from-violet-600 to-purple-800' }
        ].map((item, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${item.color} rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
            <div className="relative z-10 flex flex-col h-full">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">{item.label}</span>
              <div className="text-3xl font-black mb-auto tracking-tighter">{formatCurrency(item.sum.totalGross)}</div>
              <div className="mt-6 flex justify-between items-center bg-white/10 rounded-2xl px-4 py-3 border border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-wider">Saldo líquido</span>
                <span className="text-base font-black text-emerald-300">{formatCurrency(item.sum.totalNet)}</span>
              </div>
            </div>
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
          </div>
        ))}
      </div>

      {/* 3. Progresso Diário */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Progresso diário</h3>
              <p className="text-2xl font-black text-slate-800">
                {formatCurrency(todaySum.totalGross)} 
                <span className="text-slate-300 text-lg font-bold ml-2">/ {formatCurrency(config.dailyGoal)}</span>
              </p>
            </div>
            <div className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${isGoalReached ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {isGoalReached ? 'Meta concluída!' : 'Focando na rota'}
            </div>
          </div>
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div className={`h-full transition-all duration-1000 ease-out ${isGoalReached ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${goalPercent}%` }}></div>
          </div>
        </div>
        <div className="text-center md:text-right">
           <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Status</span>
           <div className={`text-4xl font-black ${isGoalReached ? 'text-emerald-500' : 'text-indigo-500'}`}>
             {goalPercent.toFixed(0)}%
           </div>
        </div>
      </div>

      {/* 4. Custos por KM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Custo por KM</span>
            <span className="text-xl font-black text-slate-800">{formatCurrency(fuelMetrics.costPerKm)}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Custo por entrega</span>
            <span className="text-xl font-black text-slate-800">{formatCurrency(fuelMetrics.costPerDelivery)}</span>
          </div>
        </div>
      </div>

      {/* 5. Divisão de Reservas */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-1 w-full">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Divisão de reservas</h3>
          <p className="text-xs text-slate-400 mb-6 font-bold uppercase">Baseado em todo o período acumulado</p>
          <div className="grid grid-cols-2 gap-4">
             {pieData.map(item => (
               <div key={item.name} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                 <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                 <div className="text-left">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-tight">{item.name}</span>
                    <span className="block text-sm font-black text-slate-800">{formatCurrency(item.value)}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>
        <div className="w-full lg:w-64 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
              </Pie>
              <Tooltip 
                 contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                 itemStyle={{ fontWeight: '900', fontSize: '12px' }}
                 formatter={(value: number) => formatCurrency(value)} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
