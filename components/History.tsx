
import React, { useState, useMemo } from 'react';
import { DailyEntry, AppConfig } from '../types';
import { formatCurrency, getWeeklySummary, getDailyStats } from '../utils/calculations';

interface HistoryProps {
  entries: DailyEntry[];
  config: AppConfig;
  onDelete: (id: string) => void;
  onEdit: (entry: DailyEntry) => void;
  onUpdate: (entry: DailyEntry) => void;
}

const History: React.FC<HistoryProps> = ({ entries, config, onDelete, onEdit, onUpdate }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPayment, setFilterPayment] = useState<string>('');

  const todayEntries = entries.filter(e => e.date === todayStr);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchRange = (filterStartDate || filterEndDate) ? (
        (!filterStartDate || entry.date >= filterStartDate) &&
        (!filterEndDate || entry.date <= filterEndDate)
      ) : true;
      
      // Lógica de categoria: se for lucro, categoria é 'income'. Se for gasto, pegamos o campo preenchido.
      const entryCategory = entry.category || (entry.grossAmount > 0 ? 'income' : (entry.fuel > 0 ? 'fuel' : entry.food > 0 ? 'food' : 'maintenance'));
      const matchCategory = filterCategory ? entryCategory === filterCategory : true;
      
      const matchPayment = filterPayment ? entry.paymentMethod === filterPayment : true;
      
      return matchRange && matchCategory && matchPayment;
    }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
      return dateB - dateA;
    });
  }, [entries, filterStartDate, filterEndDate, filterCategory, filterPayment]);

  const stats = useMemo(() => getWeeklySummary(filteredEntries), [filteredEntries]);
  const dailyBreakdown = useMemo(() => getDailyStats(filteredEntries, config), [filteredEntries, config]);

  const goalSummary = useMemo(() => {
    const days = dailyBreakdown.length;
    const met = dailyBreakdown.filter(d => d.goalMet).length;
    const notMet = days - met;
    return { days, met, notMet };
  }, [dailyBreakdown]);

  const clearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterCategory('');
    setFilterPayment('');
  };

  return (
    <div className="space-y-4">
      {/* Alerta de Histórico (Importante para após a restauração) */}
      {todayEntries.length === 0 && entries.length > 0 && (
        <div className="bg-indigo-50 border-2 border-indigo-200 p-6 rounded-[2rem] flex items-center justify-between gap-4 animate-in slide-in-from-left duration-500">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-sm font-black text-indigo-900 leading-tight">Backup detectado com sucesso!</p>
                <p className="text-xs text-indigo-600 font-bold">Você não tem ganhos registrados hoje, mas o seu histórico está disponível abaixo.</p>
              </div>
           </div>
        </div>
      )}

      {/* Filtros Inteligentes */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
          <div className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Início Período</label>
            <input 
              type="date" 
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm font-bold"
            />
          </div>
          <div className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Fim Período</label>
            <input 
              type="date" 
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm font-bold"
            />
          </div>
          <div className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Categoria</label>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm font-bold appearance-none"
            >
              <option value="">Todas</option>
              <option value="income">Lucros (Entradas)</option>
              <option value="fuel">Combustível</option>
              <option value="food">Alimentação</option>
              <option value="maintenance">Manutenção</option>
            </select>
          </div>
          <div className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Pagamento</label>
            <select 
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm font-bold appearance-none"
            >
              <option value="">Todos</option>
              <option value="debito">Débito</option>
              <option value="money">Dinheiro</option>
              <option value="pix">PIX</option>
            </select>
          </div>
          <button 
            onClick={clearFilters}
            className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Cards de Resumo do Período */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Bruto</span>
          <p className="text-lg font-black text-slate-800">{formatCurrency(stats.totalGross)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Líquido</span>
          <p className="text-lg font-black text-emerald-600">{formatCurrency(stats.totalNet)}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
          <span className="text-[9px] font-black text-emerald-600 uppercase block mb-1">Metas</span>
          <p className="text-lg font-black text-emerald-700">{goalSummary.met} ✓</p>
        </div>
        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
          <span className="text-[9px] font-black text-rose-600 uppercase block mb-1">Falhas</span>
          <p className="text-lg font-black text-rose-700">{goalSummary.notMet} ✗</p>
        </div>
      </div>

      {/* Lista de Movimentações (Design de Cards para Mobile) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Todas as Movimentações</h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase">
            {filteredEntries.length} itens
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-400 font-medium">Nenhum registro para exibir.</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className={`bg-white rounded-3xl p-5 border-2 transition-all hover:shadow-md ${entry.grossAmount > 0 ? 'border-indigo-50 hover:border-indigo-100' : 'border-rose-50 hover:border-rose-100'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${entry.grossAmount > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'}`}>
                      {entry.grossAmount > 0 ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 leading-tight">{entry.storeName.replace('[GASTO] ', '')}</h4>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR')} • {entry.time}
                        {entry.paymentMethod && ` • ${entry.paymentMethod.toUpperCase()}`}
                        {entry.paymentMethod !== 'money' && (
                          <span className={`ml-2 px-1.5 py-0.5 rounded-md ${entry.isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`}>
                            {entry.isPaid ? 'PAGO' : 'PENDENTE'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-black ${entry.grossAmount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {entry.grossAmount > 0 ? `+ ${formatCurrency(entry.grossAmount)}` : `- ${formatCurrency(entry.fuel + entry.food + entry.maintenance)}`}
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                      {entry.grossAmount > 0 ? 'Lucro Bruto' : 'Despesa Extra'}
                    </span>
                  </div>
                </div>

                {entry.grossAmount > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Comb.</span>
                        <span className="text-xs font-bold text-slate-600">{formatCurrency(entry.fuel)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Alim.</span>
                        <span className="text-xs font-bold text-slate-600">{formatCurrency(entry.food)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Líquido</span>
                        <span className="text-xs font-black text-emerald-600">{formatCurrency(entry.netAmount)}</span>
                      </div>
                    </div>
                    
                    {(entry.kmDriven || entry.fuelPrice) && (
                      <div className="flex gap-4 px-3 py-2 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                        {entry.kmDriven && (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className="text-[10px] font-black text-indigo-700">{entry.kmDriven} KM</span>
                          </div>
                        )}
                        {entry.fuelPrice && (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-[10px] font-black text-indigo-700">{formatCurrency(entry.fuelPrice)}/L</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Ações de Edição e Exclusão */}
                <div className="flex gap-2 border-t border-slate-50 pt-4">
                  {entry.paymentMethod !== 'money' && (
                    <button 
                      onClick={() => onUpdate({ ...entry, isPaid: !entry.isPaid })}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all active:scale-95 ${entry.isPaid ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs font-black uppercase tracking-wider">
                        {entry.isPaid ? 'Pendente' : 'Pago'}
                      </span>
                    </button>
                  )}
                  <button 
                    onClick={() => onEdit(entry)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    <span className="text-xs font-black uppercase tracking-wider">Editar</span>
                  </button>
                  <button 
                    onClick={() => onDelete(entry.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    <span className="text-xs font-black uppercase tracking-wider">Excluir</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Destaque de Produtividade Diária */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative shadow-xl">
        <div className="relative z-10">
          <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-4 tracking-widest">Linha do Tempo de Performance</h4>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             {dailyBreakdown.slice(0, 14).map((day, i) => (
               <div key={i} className={`flex-shrink-0 w-14 p-2 rounded-2xl border text-center transition-all ${day.goalMet ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-800 border-slate-700'}`}>
                  <span className="text-[9px] font-bold opacity-60 block mb-1">
                    {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${day.goalMet ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {day.goalMet ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeWidth="2" d="M12 8v4l3 3" /></svg>
                    )}
                  </div>
                  <span className="text-[11px] font-black">{day.date.split('-')[2]}</span>
               </div>
             ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 blur-[80px] -mr-10 -mt-10 rounded-full"></div>
      </div>
    </div>
  );
};

export default History;
