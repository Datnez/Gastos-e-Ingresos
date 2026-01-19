
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { FinancialData, Category } from '../types';
import { formatCurrency } from '../utils/storage';
import { DollarSign, ArrowDownRight, ArrowUpRight, Percent } from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export const Dashboard: React.FC<{ data: FinancialData }> = ({ data }) => {
  const totals = useMemo(() => {
    const expenses = data.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const incomes = data.incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const invested = data.cdts.reduce((acc, curr) => acc + curr.amount, 0);
    return { expenses, incomes, balance: incomes - expenses, invested };
  }, [data]);

  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    data.expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.keys(map).map(key => ({ name: key, value: map[key] }));
  }, [data]);

  const monthlyHistory = useMemo(() => {
    // Generate last 6 months
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleString('es', { month: 'short' });
      const monthIndex = d.getMonth();
      const year = d.getFullYear();

      const mIncomes = data.incomes
        .filter(inc => {
          const incDate = new Date(inc.date);
          return incDate.getMonth() === monthIndex && incDate.getFullYear() === year;
        })
        .reduce((sum, curr) => sum + curr.amount, 0);

      const mExpenses = data.expenses
        .filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === monthIndex && expDate.getFullYear() === year;
        })
        .reduce((sum, curr) => sum + curr.amount, 0);

      result.push({
        month: monthStr,
        ingresos: mIncomes,
        gastos: mExpenses,
        ahorro: mIncomes - mExpenses
      });
    }
    return result;
  }, [data]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resumen Financiero</h1>
          <p className="text-slate-500">Control de tus finanzas en tiempo real.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Ingresos Totales" 
          value={totals.incomes} 
          icon={<ArrowUpRight className="text-emerald-500" />} 
          color="border-emerald-500"
        />
        <SummaryCard 
          title="Gastos Totales" 
          value={totals.expenses} 
          icon={<ArrowDownRight className="text-rose-500" />} 
          color="border-rose-500"
        />
        <SummaryCard 
          title="Balance" 
          value={totals.balance} 
          icon={<DollarSign className="text-indigo-500" />} 
          color="border-indigo-500"
        />
        <SummaryCard 
          title="Invertido CDT" 
          value={totals.invested} 
          icon={<Percent className="text-amber-500" />} 
          color="border-amber-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income vs Expenses Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6 text-slate-800">Ingresos vs Gastos Mensuales</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" />
                <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} name="Ingresos" />
                <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6 text-slate-800">Gastos por Categoría</h3>
          <div className="h-80">
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">
                Sin datos de gastos registrados
              </div>
            )}
          </div>
        </div>

        {/* Savings Evolution Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-6 text-slate-800">Evolución del Ahorro</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis hide />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="ahorro" stroke="#4f46e5" strokeWidth={3} dot={{r: 6, fill: '#4f46e5'}} name="Balance" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${color} flex items-center justify-between`}>
    <div>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(value)}</p>
    </div>
    <div className="p-3 bg-slate-50 rounded-full">{icon}</div>
  </div>
);
