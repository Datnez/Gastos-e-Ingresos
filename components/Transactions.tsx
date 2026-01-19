
import React, { useState } from 'react';
import { Plus, Search, Trash2, Calendar, CreditCard, Tag } from 'lucide-react';
import { Expense, Income, Category, PaymentMethod, IncomeSource } from '../types';
import { formatCurrency } from '../utils/storage';

interface TransactionsProps {
  type: 'expenses' | 'incomes';
  items: (Expense | Income)[];
  onAdd: (item: any) => void;
  onDelete: (id: string) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ type, items, onAdd, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item => 
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 capitalize">
            {type === 'expenses' ? 'Gestión de Gastos' : 'Gestión de Ingresos'}
          </h2>
          <p className="text-slate-500">Listado y registro de tus movimientos.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-md active:scale-95"
        >
          {showForm ? <Trash2 size={18} /> : <Plus size={18} />}
          <span>{showForm ? 'Cancelar' : (type === 'expenses' ? 'Añadir Gasto' : 'Añadir Ingreso')}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-slideDown">
          {type === 'expenses' ? (
            <ExpenseForm onSubmit={(val) => { onAdd(val); setShowForm(false); }} />
          ) : (
            <IncomeForm onSubmit={(val) => { onAdd(val); setShowForm(false); }} />
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50">
          <Search className="text-slate-400 mr-2" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por descripción..." 
            className="bg-transparent border-none focus:ring-0 text-sm flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-slate-500 font-semibold bg-slate-50/50">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4">{type === 'expenses' ? 'Categoría' : 'Fuente'}</th>
                {type === 'expenses' && <th className="px-6 py-4">Medio Pago</th>}
                <th className="px-6 py-4 text-right">Monto</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{item.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      type === 'expenses' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {type === 'expenses' ? (item as Expense).category : (item as Income).source}
                    </span>
                  </td>
                  {type === 'expenses' && (
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center space-x-2">
                        <CreditCard size={14} className="text-slate-400" />
                        <span>{(item as Expense).paymentMethod}</span>
                      </div>
                    </td>
                  )}
                  <td className={`px-6 py-4 text-sm font-bold text-right ${type === 'expenses' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {type === 'expenses' ? '-' : '+'}{formatCurrency(item.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    No se encontraron registros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ExpenseForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Otros' as Category,
    amount: '',
    paymentMethod: 'PSE' as PaymentMethod
  });

  return (
    <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={(e) => {
      e.preventDefault();
      onSubmit({ ...formData, amount: parseFloat(formData.amount) });
    }}>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Fecha</label>
        <input 
          type="date" required 
          className="w-full p-2 border border-slate-200 rounded-lg"
          value={formData.date}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
        <input 
          type="text" placeholder="Ej: Supermercado" required 
          className="w-full p-2 border border-slate-200 rounded-lg"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Monto</label>
        <input 
          type="number" placeholder="0.00" required 
          className="w-full p-2 border border-slate-200 rounded-lg"
          value={formData.amount}
          onChange={e => setFormData({ ...formData, amount: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Categoría</label>
        <select 
          className="w-full p-2 border border-slate-200 rounded-lg"
          value={formData.category}
          onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
        >
          {['Servicios', 'Mercado', 'Transporte', 'Entretenimiento', 'Salud', 'Educación', 'Otros'].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Medio de Pago</label>
        <select 
          className="w-full p-2 border border-slate-200 rounded-lg"
          value={formData.paymentMethod}
          onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
        >
          {['PSE', 'Efectivo', 'Tarjeta', 'Transferencia'].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
          Guardar Gasto
        </button>
      </div>
    </form>
  );
};

const IncomeForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    source: 'Salario' as IncomeSource
  });

  return (
    <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={(e) => {
      e.preventDefault();
      onSubmit({ ...formData, amount: parseFloat(formData.amount) });
    }}>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Fecha</label>
        <input 
          type="date" required 
          className="w-full p-2 border border-slate-200 rounded-lg"
          value={formData.date}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
        <input 
          type="text" placeholder="Ej: Pago mensual" required 
          className="w-full p-2 border border-slate-200 rounded-lg"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Monto</label>
        <input 
          type="number" placeholder="0.00" required 
          className="w-full p-2 border border-slate-200 rounded-lg"
          value={formData.amount}
          onChange={e => setFormData({ ...formData, amount: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Fuente</label>
        <select 
          className="w-full p-2 border border-slate-200 rounded-lg"
          value={formData.source}
          onChange={e => setFormData({ ...formData, source: e.target.value as IncomeSource })}
        >
          {['Salario', 'Extra', 'Rendimientos', 'Otros'].map(src => (
            <option key={src} value={src}>{src}</option>
          ))}
        </select>
      </div>
      <div className="md:col-span-4 mt-2">
        <button type="submit" className="w-full bg-emerald-600 text-white p-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors">
          Guardar Ingreso
        </button>
      </div>
    </form>
  );
};
