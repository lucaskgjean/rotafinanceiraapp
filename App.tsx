
import React, { useState, useEffect, useCallback } from 'react';
import { DailyEntry, AppConfig, DEFAULT_CONFIG } from './types';
import QuickLaunch from './components/QuickLaunch';
import QuickExpense from './components/QuickExpense';
import QuickKM from './components/QuickKM';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Expenses from './components/Expenses';
import Maintenance from './components/Maintenance';
import Settings from './components/Settings';
import EditModal from './components/EditModal';
import { generateId } from './utils/calculations';

const App: React.FC = () => {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'maintenance' | 'history' | 'settings'>('dashboard');
  const [editingEntry, setEditingEntry] = useState<DailyEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Carregamento Inicial
  useEffect(() => {
    const savedEntries = localStorage.getItem('rota_financeira_data');
    const savedConfig = localStorage.getItem('rota_financeira_config');
    if (savedEntries) {
      try { 
        const parsed = JSON.parse(savedEntries);
        // Garante que cada entrada tenha um ID ao carregar (sanitização)
        const sanitized = (Array.isArray(parsed) ? parsed : []).map(entry => ({
          ...entry,
          id: entry.id || generateId()
        }));
        setEntries(sanitized);
      } catch (e) { console.error("Erro ao carregar entradas", e); }
    }
    if (savedConfig) {
      try { 
        const parsedConfig = JSON.parse(savedConfig);
        // Garante que os alertas de manutenção existam se não estiverem no salvo
        if (!parsedConfig.maintenanceAlerts) {
          parsedConfig.maintenanceAlerts = DEFAULT_CONFIG.maintenanceAlerts;
        }
        setConfig(parsedConfig); 
      } catch (e) { console.error("Erro ao carregar config", e); }
    }
  }, []);

  // Persistência com Feedback
  useEffect(() => {
    setIsSaving(true);
    localStorage.setItem('rota_financeira_data', JSON.stringify(entries));
    const timer = setTimeout(() => setIsSaving(false), 800);
    return () => clearTimeout(timer);
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('rota_financeira_config', JSON.stringify(config));
  }, [config]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addEntry = (entry: DailyEntry) => {
    setEntries(prev => [...prev, entry]);
    if (entry.fuelPrice) {
      setConfig(prev => ({ ...prev, lastFuelPrice: entry.fuelPrice }));
    }
    showToast("Lançamento salvo!");
  };
  
  const updateEntry = (updated: DailyEntry) => {
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
    setEditingEntry(null);
    showToast("Alteração protegida!");
  };

  const deleteEntry = useCallback((id: string) => {
    if (!id) return;
    
    if (window.confirm("Deseja excluir este registro permanentemente?")) {
      setEntries(prev => {
        const filtered = prev.filter(e => e.id !== id);
        // Feedback visual imediato de que a lista mudou
        if (filtered.length === prev.length) {
          console.warn("Nenhum item encontrado com o ID:", id);
        }
        return filtered;
      });
      showToast("Registro removido.", "error");
    }
  }, []);

  const importData = (newEntries: DailyEntry[], newConfig?: AppConfig) => {
    // Sanitização profunda na importação: garante que todos tenham IDs
    const sanitizedEntries = newEntries.map(entry => ({
      ...entry,
      id: entry.id || generateId()
    }));

    // Limpeza preventiva
    localStorage.removeItem('rota_financeira_data');
    if (newConfig) localStorage.removeItem('rota_financeira_config');

    setEntries(sanitizedEntries);
    if (newConfig) setConfig(newConfig);

    showToast(`Restauração concluída! ${sanitizedEntries.length} registros.`);
    setActiveTab('history'); 
  };

  return (
    <div className="min-h-screen pb-28 bg-slate-50 font-sans antialiased text-slate-900 selection:bg-indigo-100">
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl text-white font-black text-sm transition-all animate-in slide-in-from-top-4 ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-600'}`}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
            {toast.message}
          </div>
        </div>
      )}

      {editingEntry && (
        <EditModal 
          entry={editingEntry} 
          config={config} 
          onSave={updateEntry} 
          onClose={() => setEditingEntry(null)} 
        />
      )}

      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
              <svg className="w-7 h-7 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="28" cy="78" r="10" stroke="currentColor" strokeWidth="6" />
                <circle cx="75" cy="78" r="10" stroke="currentColor" strokeWidth="6" />
                <path d="M28 78 C28 60 35 45 45 45 H70 L75 78" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="22" y="22" width="30" height="24" rx="6" fill="#10b981" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Rota<span className="text-indigo-600">Financeira</span></h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                  {isSaving ? 'Salvando...' : 'Nuvem Local Ativa'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => setActiveTab('settings')} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {(activeTab === 'dashboard' || activeTab === 'history') && (
          <QuickLaunch onAdd={addEntry} existingEntries={entries} config={config} />
        )}
        {activeTab === 'dashboard' && (
          <QuickKM onAdd={addEntry} config={config} />
        )}
        {activeTab === 'expenses' && <QuickExpense onAdd={addEntry} />}

        {activeTab === 'dashboard' && <Dashboard entries={entries} config={config} onEdit={setEditingEntry} onDelete={deleteEntry} onNavigate={setActiveTab} />}
        {activeTab === 'expenses' && <Expenses entries={entries} config={config} onEdit={setEditingEntry} />}
        {activeTab === 'maintenance' && <Maintenance entries={entries} config={config} onEdit={setEditingEntry} />}
        {activeTab === 'history' && <History entries={entries} config={config} onDelete={deleteEntry} onEdit={setEditingEntry} />}
        {activeTab === 'settings' && <Settings config={config} entries={entries} onChange={setConfig} onImport={importData} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-100 md:hidden pb-safe z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-20 px-2">
          {[
            { id: 'dashboard', label: 'Início', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
            { id: 'expenses', label: 'Gastos', icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM12 18V6" /></> },
            { id: 'maintenance', label: 'Manut.', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> },
            { id: 'history', label: 'Histórico', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
            { id: 'settings', label: 'Perfil', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2" /> }
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className="flex flex-col items-center flex-1 py-1 group">
              <div className={`w-16 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeTab === item.id ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
              </div>
              <span className={`text-[11px] mt-1 font-bold tracking-tight ${activeTab === item.id ? 'text-indigo-700' : 'text-slate-500'}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
