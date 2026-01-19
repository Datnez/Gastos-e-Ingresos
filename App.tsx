
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp, 
  PiggyBank, 
  Menu,
  X,
  Settings as SettingsIcon,
  Database,
  Cloud,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { loadData, saveData, getSyncUrl, syncToSheets } from './utils/storage';
import { Expense, Income, CDT, FinancialData } from './types';

// Components
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { CDTModule } from './components/CDTModule';
import { Settings } from './components/Settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'incomes' | 'cdts' | 'settings'>('dashboard');
  const [data, setData] = useState<FinancialData>(loadData());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, expenses: [newExpense, ...prev.expenses] }));
  };

  const deleteExpense = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este gasto?')) {
      setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
    }
  };

  const addIncome = (income: Omit<Income, 'id'>) => {
    const newIncome = { ...income, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, incomes: [newIncome, ...prev.incomes] }));
  };

  const deleteIncome = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este ingreso?')) {
      setData(prev => ({ ...prev, incomes: prev.incomes.filter(i => i.id !== id) }));
    }
  };

  const addCDT = (cdt: Omit<CDT, 'id'>) => {
    const newCDT = { ...cdt, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, cdts: [newCDT, ...prev.cdts] }));
  };

  const deleteCDT = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este CDT?')) {
      setData(prev => ({ ...prev, cdts: prev.cdts.filter(c => c.id !== id) }));
    }
  };

  const handleImport = (newData: FinancialData) => {
    setData(newData);
  };

  const handleCloudSync = async () => {
    const url = getSyncUrl();
    if (!url) {
      setActiveTab('settings');
      alert("Por favor, configura primero la URL de tu Web App de Google Sheets en Configuración.");
      return;
    }
    setIsSyncing(true);
    try {
      await syncToSheets(url, data);
      const now = new Date().toLocaleString('es-CO');
      setData(prev => ({ ...prev, lastSync: now }));
      alert("¡Sincronización exitosa con Google Sheets!");
    } catch (error) {
      alert("Error al sincronizar: " + (error as Error).message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center shadow-md z-50">
        <div className="flex items-center space-x-2">
          <PiggyBank className="w-8 h-8 text-emerald-400" />
          <span className="font-bold text-xl tracking-tight">FinancePro</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 transition-transform duration-200 ease-in-out
        w-64 bg-indigo-900 text-slate-300 flex flex-col z-40 shadow-xl
      `}>
        <div className="p-6 hidden md:flex items-center space-x-3 mb-6">
          <PiggyBank className="w-10 h-10 text-emerald-400" />
          <span className="font-bold text-2xl text-white tracking-tight">FinancePro</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-800'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => { setActiveTab('expenses'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'expenses' ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-800'}`}
          >
            <Receipt size={20} />
            <span className="font-medium">Gastos</span>
          </button>
          <button 
            onClick={() => { setActiveTab('incomes'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'incomes' ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-800'}`}
          >
            <TrendingUp size={20} />
            <span className="font-medium">Ingresos</span>
          </button>
          <button 
            onClick={() => { setActiveTab('cdts'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'cdts' ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-800'}`}
          >
            <PiggyBank size={20} />
            <span className="font-medium">Inversiones CDT</span>
          </button>
          <div className="pt-4 mt-4 border-t border-indigo-800">
            <button 
              onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-800'}`}
            >
              <SettingsIcon size={20} />
              <span className="font-medium">Configuración</span>
            </button>
          </div>
        </nav>

        <div className="p-4 space-y-3">
          <button 
            onClick={handleCloudSync}
            disabled={isSyncing}
            className={`w-full flex flex-col items-center justify-center p-3 rounded-xl text-sm font-bold transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
          >
            <div className="flex items-center space-x-2">
              <Cloud size={18} className={isSyncing ? 'animate-bounce' : ''} />
              <span>{isSyncing ? 'Sincronizando...' : 'Subir a Sheets'}</span>
            </div>
            {data.lastSync && (
              <div className="flex items-center space-x-1 mt-1 text-[9px] text-indigo-200 font-normal">
                <CheckCircle2 size={10} />
                <span>Sync: {data.lastSync}</span>
              </div>
            )}
          </button>

          <div className="bg-indigo-950/50 p-3 rounded-xl">
            <div className="flex items-center space-x-2 text-[10px] text-indigo-400 uppercase font-bold tracking-widest mb-1">
              <Database size={10} />
              <span>Estado Datos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] text-indigo-200">Local + Nube OK</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard data={data} />}
          {activeTab === 'expenses' && (
            <Transactions 
              type="expenses" 
              items={data.expenses} 
              onAdd={addExpense} 
              onDelete={deleteExpense} 
            />
          )}
          {activeTab === 'incomes' && (
            <Transactions 
              type="incomes" 
              items={data.incomes} 
              onAdd={addIncome} 
              onDelete={deleteIncome} 
            />
          )}
          {activeTab === 'cdts' && (
            <CDTModule 
              items={data.cdts} 
              onAdd={addCDT} 
              onDelete={deleteCDT} 
            />
          )}
          {activeTab === 'settings' && (
            <Settings 
              data={data} 
              onImport={handleImport} 
              onReset={() => {
                if(confirm("¿Seguro que quieres borrar TODOS los datos?")) {
                  const empty = { expenses: [], incomes: [], cdts: [] };
                  setData(empty);
                }
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
