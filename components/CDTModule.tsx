
import React, { useState, useMemo } from 'react';
import { CDT } from '../types';
import { formatCurrency } from '../utils/storage';
import { PiggyBank, Plus, TrendingUp, Calendar, Landmark, Trash2, Clock, CheckCircle } from 'lucide-react';

interface CDTModuleProps {
  items: CDT[];
  onAdd: (cdt: Omit<CDT, 'id'>) => void;
  onDelete: (id: string) => void;
}

export const CDTModule: React.FC<CDTModuleProps> = ({ items, onAdd, onDelete }) => {
  const [showForm, setShowForm] = useState(false);

  const stats = useMemo(() => {
    const active = items.filter(c => new Date(c.endDate) > new Date());
    const expired = items.filter(c => new Date(c.endDate) <= new Date());
    
    const totalInvested = active.reduce((sum, c) => sum + c.amount, 0);
    
    // Simple yield estimation: Amount * Rate% * (Days / 365)
    const estimatedProfit = active.reduce((sum, c) => {
      const start = new Date(c.startDate);
      const end = new Date(c.endDate);
      const days = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
      return sum + (c.amount * (c.interestRate / 100) * (days / 365));
    }, 0);

    return { totalInvested, estimatedProfit, activeCount: active.length, expiredCount: expired.length };
  }, [items]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inversiones en CDT</h2>
          <p className="text-slate-500">Haz crecer tus ahorros y monitorea tus rendimientos.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-md transition-all active:scale-95"
        >
          {showForm ? <Trash2 size={18} /> : <Plus size={18} />}
          <span>{showForm ? 'Cancelar' : 'Nuevo CDT'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Invertido" value={formatCurrency(stats.totalInvested)} icon={<PiggyBank className="text-amber-500" />} />
        <StatCard title="Rendimiento Estimado" value={formatCurrency(stats.estimatedProfit)} icon={<TrendingUp className="text-emerald-500" />} />
        <StatCard title="CDTs Activos" value={stats.activeCount.toString()} icon={<Clock className="text-blue-500" />} />
        <StatCard title="CDTs Vencidos" value={stats.expiredCount.toString()} icon={<CheckCircle className="text-slate-400" />} />
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-slideDown">
          <CDTForm onSubmit={(val) => { onAdd(val); setShowForm(false); }} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((cdt) => (
          <CDTCard key={cdt.id} cdt={cdt} onDelete={onDelete} />
        ))}
        {items.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
            <PiggyBank className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400">No tienes inversiones registradas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CDTCard: React.FC<{ cdt: CDT; onDelete: (id: string) => void }> = ({ cdt, onDelete }) => {
  const isExpired = new Date(cdt.endDate) <= new Date();
  
  const profit = useMemo(() => {
    const start = new Date(cdt.startDate);
    const end = new Date(cdt.endDate);
    const days = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
    return (cdt.amount * (cdt.interestRate / 100) * (days / 365));
  }, [cdt]);

  return (
    <div className={`bg-white rounded-2xl border ${isExpired ? 'border-slate-100 bg-slate-50 opacity-80' : 'border-amber-100 shadow-sm'} overflow-hidden relative group`}>
      <div className={`p-4 ${isExpired ? 'bg-slate-200' : 'bg-amber-50'} flex justify-between items-center`}>
        <div className="flex items-center space-x-2">
          <Landmark size={18} className={isExpired ? 'text-slate-400' : 'text-amber-600'} />
          <span className={`font-bold uppercase tracking-wide text-xs ${isExpired ? 'text-slate-500' : 'text-amber-800'}`}>{cdt.bank}</span>
        </div>
        <button onClick={() => onDelete(cdt.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <p className="text-xs text-slate-500 uppercase font-bold">Monto Invertido</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(cdt.amount)}</p>
        </div>
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-slate-500 text-xs uppercase font-bold">Tasa</p>
            <p className="font-semibold">{cdt.interestRate}% E.A.</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-xs uppercase font-bold">Rendimiento</p>
            <p className="font-semibold text-emerald-600">+{formatCurrency(profit)}</p>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-500">
            <Calendar size={12} className="mr-1" />
            <span>{cdt.startDate}</span>
          </div>
          <div className="text-slate-300">→</div>
          <div className="flex items-center text-xs text-slate-500">
            <Calendar size={12} className="mr-1" />
            <span>{cdt.endDate}</span>
          </div>
        </div>
        {isExpired && (
          <div className="mt-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            VENCIDO
          </div>
        )}
      </div>
    </div>
  );
};

const CDTForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    bank: '',
    amount: '',
    interestRate: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" onSubmit={(e) => {
      e.preventDefault();
      onSubmit({ 
        ...formData, 
        amount: parseFloat(formData.amount),
        interestRate: parseFloat(formData.interestRate)
      });
    }}>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Banco</label>
        <input 
          type="text" placeholder="Nombre de la entidad" required 
          className="w-full p-2 border border-slate-200 rounded-lg"
          value={formData.bank}
          onChange={e => setFormData({ ...formData, bank: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Monto Invertido</label>
        <input 
          type="number" placeholder="0.00" required 
          className="w-full p-2 border border-slate-200 rounded-lg"
          value={formData.amount}
          onChange={e => setFormData({ ...formData, amount: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Tasa de Interés (%)</label>
        <input 
          type="number" step="0.01" placeholder="Ej: 11.5" required 
          className="w-full p-2 border border-slate-200 rounded-lg"
          value={formData.interestRate}
          onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Fecha Inicio</label>
        <input 
          type="date" required 
          className="w-full p-2 border border-slate-200 rounded-lg"
          value={formData.startDate}
          onChange={e => setFormData({ ...formData, startDate: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Fecha Vencimiento</label>
        <input 
          type="date" required 
          className="w-full p-2 border border-slate-200 rounded-lg"
          value={formData.endDate}
          onChange={e => setFormData({ ...formData, endDate: e.target.value })}
        />
      </div>
      <div className="flex items-end">
        <button type="submit" className="w-full bg-amber-600 text-white p-2 rounded-lg font-bold hover:bg-amber-700 transition-colors">
          Guardar Inversión
        </button>
      </div>
    </form>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
    <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{title}</p>
      <p className="text-lg font-bold text-slate-800">{value}</p>
    </div>
  </div>
);
