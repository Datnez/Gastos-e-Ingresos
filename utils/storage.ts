
import { FinancialData, Expense, Income, CDT } from '../types';

const STORAGE_KEY = 'finance_pro_data';
const SYNC_URL_KEY = 'finance_pro_sync_url';

const DEFAULT_DATA: FinancialData = {
  expenses: [],
  incomes: [],
  cdts: []
};

export const loadData = (): FinancialData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_DATA;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse stored data", e);
    return DEFAULT_DATA;
  }
};

export const saveData = (data: FinancialData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getSyncUrl = () => localStorage.getItem(SYNC_URL_KEY) || '';
export const setSyncUrl = (url: string) => localStorage.setItem(SYNC_URL_KEY, url);

export const syncToSheets = async (url: string, data: FinancialData) => {
  if (!url) throw new Error("URL de sincronización no configurada");
  const response = await fetch(url, {
    method: 'POST',
    mode: 'no-cors', // Apps Script requires no-cors for simple posts or careful CORS handling
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  // Since no-cors doesn't allow reading the response, we assume success if no error is thrown
  return true;
};

export const fetchFromSheets = async (url: string): Promise<FinancialData> => {
  if (!url) throw new Error("URL de sincronización no configurada");
  const response = await fetch(url);
  if (!response.ok) throw new Error("Error al obtener datos de Google Sheets");
  return await response.json();
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

export const exportToCSV = (data: any[], fileName: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => {
    return Object.values(obj).map(val => 
      typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
    ).join(',');
  }).join('\n');
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + rows;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data: FinancialData) => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const exportFileDefaultName = `finance_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importFromJSON = (file: File): Promise<FinancialData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.expenses && json.incomes && json.cdts) {
          resolve(json);
        } else {
          reject(new Error("Formato de archivo inválido"));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
};
