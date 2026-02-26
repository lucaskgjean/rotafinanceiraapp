
import React from 'react';
import { DailyEntry, AppConfig } from '../types';
import { formatCurrency } from '../utils/calculations';

interface MaintenanceProps {
  entries: DailyEntry[];
  config: AppConfig;
  onEdit: (entry: DailyEntry) => void;
}

const Maintenance: React.FC<MaintenanceProps> = ({ entries, config, onEdit }) => {
  const maintenanceEntries = entries.filter(e => e.maintenance > 0 && e.grossAmount === 0);
  const incomeEntries = entries.filter(e => e.grossAmount > 0);
  
  const totalReserved = incomeEntries.reduce((acc, curr) => acc + curr.maintenance, 0);
  const totalSpent = maintenanceEntries.reduce((acc, curr) => acc + curr.maintenance, 0);
  const balance = totalReserved - totalSpent;

  const lastKmEntry = entries.reduce((max, curr) => {
    const km = curr.kmDriven || curr.kmAtMaintenance || 0;
    return km > max ? km : max;
  }, 0);

  const alerts = config.maintenanceAlerts || [];

  return (
    <div className="space-y-5">
      {/* Header de Saldo */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Reserva para manutenção</h2>
          <div className="text-4xl font-black text-slate-800 tracking-tighter">{formatCurrency(balance)}</div>
          <p className="text-xs text-slate-400 mt-2 font-bold">Total reservado: {formatCurrency(totalReserved)}</p>
        </div>
        <div className="text-center md:text-right">
          <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">KM atual estimado</span>
          <div className="text-3xl font-black text-blue-600 tracking-tighter">{lastKmEntry.toLocaleString()} KM</div>
        </div>
      </div>

      {/* Alertas de Manutenção */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {alerts.map(alert => {
          const maintenanceForThis = maintenanceEntries.filter(e => e.storeName.toLowerCase().includes(alert.description.toLowerCase()));
          const lastMaintenanceKm = maintenanceForThis.length > 0 
            ? Math.max(...maintenanceForThis.map(e => e.kmAtMaintenance || 0))
            : alert.lastKm;
          
          const nextMaintenanceKm = lastMaintenanceKm + alert.kmInterval;
          const kmRemaining = nextMaintenanceKm - lastKmEntry;
          const progress = Math.min(100, Math.max(0, ((lastKmEntry - lastMaintenanceKm) / alert.kmInterval) * 100));
          
          const isUrgent = kmRemaining < 1000;

          return (
            <div key={alert.id} className={`bg-white p-6 rounded-[2rem] border-2 transition-all ${isUrgent ? 'border-rose-100 shadow-rose-50' : 'border-slate-50 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUrgent ? 'bg-rose-100 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {isUrgent && (
                  <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase animate-pulse">Urgente</span>
                )}
              </div>
              
              <h4 className="font-black text-slate-800 mb-1">{alert.description}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">A cada {alert.kmInterval.toLocaleString()} KM</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-slate-400">Restam</span>
                  <span className={isUrgent ? 'text-rose-500' : 'text-slate-700'}>{kmRemaining.toLocaleString()} KM</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${isUrgent ? 'bg-rose-500' : 'bg-blue-500'}`} 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Histórico de Manutenção */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-800 px-2">Histórico de serviços</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {maintenanceEntries.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm font-bold italic">Nenhuma manutenção registrada ainda.</p>
            </div>
          ) : (
            maintenanceEntries.sort((a, b) => b.date.localeCompare(a.date)).map(entry => (
              <div key={entry.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-all">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-black text-slate-800 leading-tight">{entry.storeName.replace('[GASTO] ', '')}</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR')} • {entry.kmAtMaintenance?.toLocaleString()} KM
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-800">{formatCurrency(entry.maintenance)}</p>
                  <button 
                    onClick={() => onEdit(entry)}
                    className="text-[9px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
