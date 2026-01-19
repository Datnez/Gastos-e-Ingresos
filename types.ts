
export type Category = 'Servicios' | 'Mercado' | 'Transporte' | 'Entretenimiento' | 'Salud' | 'Educación' | 'Otros';
export type PaymentMethod = 'PSE' | 'Efectivo' | 'Tarjeta' | 'Transferencia';
export type IncomeSource = 'Salario' | 'Extra' | 'Rendimientos' | 'Otros';

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: Category;
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface Income {
  id: string;
  date: string;
  description: string;
  amount: number;
  source: IncomeSource;
}

export interface CDT {
  id: string;
  bank: string;
  amount: number;
  interestRate: number; // Percentage
  startDate: string;
  endDate: string;
  isExpired?: boolean;
}

export interface FinancialData {
  expenses: Expense[];
  incomes: Income[];
  cdts: CDT[];
  lastSync?: string;
}
