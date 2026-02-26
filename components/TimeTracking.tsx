
import React, { useState, useMemo } from 'react';
import { TimeEntry } from '../types';
import { generateId, calculateDuration, formatDuration } from '../utils/calculations';

interface TimeTrackingProps {
  timeEntries: TimeEntry[];
  onAdd: (entry: TimeEntry) => void;
  onUpdate: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
}

const TimeTracking: React.FC<TimeTrackingProps> = ({ timeEntries, onAdd, onUpdate, onDelete }) => {
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  const activeEntry = useMemo(() => 
    timeEntries.find(e => e.date === today && !e.endTime),
    [timeEntries, today]
  );

  const [breakInput, setBreakInput] = useState<string>('0');
  const [notesInput, setNotesInput] = useState<string>('');

  const handleClockIn = () => {
    const newEntry: TimeEntry = {
      id: generateId(),
      date: today,
      startTime: currentTime,
      notes: ''
    };
    onAdd(newEntry);
  };

  const handleClockOut = () => {
    if (!activeEntry) return;
    const updatedEntry: TimeEntry = {
      ...activeEntry,
      endTime: currentTime,
      breakDuration: parseInt(breakInput) || 0,
      notes: notesInput
    };
    onUpdate(updatedEntry);
    setBreakInput('0');
    setNotesInput('');
  };

  const dailyTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    timeEntries.forEach(e => {
      if (e.startTime && e.endTime) {
        const duration = calculateDuration(e.startTime, e.endTime, e.breakDuration || 0);
        totals[e.date] = (totals[e.date] || 0) + duration;
      }
    });
    return totals;
  }, [timeEntries]);

  const sortedDates = Object.keys(dailyTotals).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Status de Ponto Atual */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Status do ponto</h2>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${activeEntry ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
              <span className="text-2xl font-black text-slate-800 tracking-tighter">
                {activeEntry ? `Trabalhando desde ${activeEntry.startTime}` : 'Fora de serviço'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-bold">Hoje: {formatDuration(dailyTotals[today] || 0)}</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {!activeEntry ? (
              <button 
                onClick={handleClockIn}
                className="flex-1 md:flex-none bg-emerald-600 text-white font-black py-4 px-10 rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                </svg>
                Registrar entrada
              </button>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Pausa (min)</label>
                    <input 
                      type="number" 
                      value={breakInput} 
                      onChange={(e) => setBreakInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Observações</label>
                    <input 
                      type="text" 
                      value={notesInput} 
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="Ex: Almoço..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleClockOut}
                  className="bg-rose-600 text-white font-black py-4 px-10 rounded-2xl hover:bg-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-100 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                  Registrar saída
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Relatório de Horas */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-slate-800 px-2 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
          Relatório de Horas Trabalhadas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedDates.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
               <p className="text-slate-400 text-sm font-medium italic">Nenhum registro de ponto encontrado.</p>
            </div>
          ) : (
            sortedDates.map(date => (
              <div key={date} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Data</span>
                    <p className="text-sm font-black text-slate-700">
                      {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Total</span>
                    <p className="text-xl font-black text-emerald-600">{formatDuration(dailyTotals[date])}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {timeEntries
                    .filter(e => e.date === date)
                    .sort((a, b) => b.startTime.localeCompare(a.startTime))
                    .map(entry => (
                      <div key={entry.id} className="group flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-700">
                              {entry.startTime} — {entry.endTime || 'Em aberto'}
                            </p>
                            {entry.breakDuration ? (
                              <p className="text-[9px] text-rose-400 font-bold uppercase">Pausa: {entry.breakDuration}m</p>
                            ) : null}
                            {entry.notes && (
                              <p className="text-[9px] text-slate-400 italic">{entry.notes}</p>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => onDelete(entry.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
