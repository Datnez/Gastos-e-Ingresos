
import React, { useRef, useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  Trash2, 
  ShieldCheck, 
  Info,
  FileJson,
  Database,
  Link,
  Cloud,
  ExternalLink,
  Code
} from 'lucide-react';
import { FinancialData } from '../types';
import { exportToJSON, importFromJSON, getSyncUrl, setSyncUrl, fetchFromSheets } from '../utils/storage';

interface SettingsProps {
  data: FinancialData;
  onImport: (data: FinancialData) => void;
  onReset: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ data, onImport, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syncUrl, setSyncUrlState] = useState(getSyncUrl());
  const [isLoadingFromCloud, setIsLoadingFromCloud] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const newData = await importFromJSON(file);
        onImport(newData);
        alert("Datos importados exitosamente.");
      } catch (err) {
        alert("Error al importar el archivo. Verifica que sea un JSON válido.");
      }
    }
  };

  const handleSaveSyncUrl = () => {
    setSyncUrl(syncUrl);
    alert("URL de sincronización guardada.");
  };

  const handleFetchFromCloud = async () => {
    if (!syncUrl) return alert("Configura primero la URL.");
    if (!confirm("Esto reemplazará tus datos locales con los de Google Sheets. ¿Continuar?")) return;
    
    setIsLoadingFromCloud(true);
    try {
      const cloudData = await fetchFromSheets(syncUrl);
      onImport(cloudData);
      alert("¡Datos recuperados de Google Sheets con éxito!");
    } catch (err) {
      alert("Error al bajar datos: Asegúrate de que la Web App esté desplegada y configurada como 'Cualquiera' tiene acceso.");
    } finally {
      setIsLoadingFromCloud(false);
    }
  };

  const scriptCode = `function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var scriptProp = PropertiesService.getScriptProperties();
  scriptProp.setProperty('financeData', JSON.stringify(data));
  return ContentService.createTextOutput(JSON.stringify({result: 'success'})).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  var scriptProp = PropertiesService.getScriptProperties();
  var data = scriptProp.getProperty('financeData');
  return ContentService.createTextOutput(data || '{"expenses":[],"incomes":[],"cdts":[]}').setMimeType(ContentService.MimeType.JSON);
}`;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500">Gestiona tus datos y preferencias del sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Google Sheets Sync */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 md:col-span-2">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Cloud size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Conexión con Google Sheets</h3>
              <p className="text-xs text-slate-500">Vincula tu app con tu hoja de cálculo personal.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center space-x-1">
                    <Link size={12} />
                    <span>URL de Web App (Apps Script)</span>
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="flex-1 p-2 border border-slate-200 rounded-lg text-sm"
                      value={syncUrl}
                      onChange={(e) => setSyncUrlState(e.target.value)}
                    />
                    <button 
                      onClick={handleSaveSyncUrl}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <p className="text-xs font-bold text-slate-700 uppercase">Acciones Remotas</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleFetchFromCloud}
                      disabled={isLoadingFromCloud}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium transition-all"
                    >
                      <Download size={16} />
                      <span>{isLoadingFromCloud ? 'Bajando...' : 'Bajar de Sheets'}</span>
                    </button>
                    <a 
                      href="https://docs.google.com/spreadsheets/d/1Yw2ZOBNbHq6b2sSABmvZr22Sm9jQSO6XZ603wlZcql0/edit#gid=0"
                      target="_blank"
                      className="flex-1 flex items-center justify-center space-x-2 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-all"
                    >
                      <ExternalLink size={16} />
                      <span>Ver Spreadsheet</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div className="flex items-center space-x-2 text-indigo-700 mb-2">
                    <Code size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Instrucciones de Instalación</span>
                  </div>
                  <ol className="text-[11px] text-slate-600 space-y-2 list-decimal ml-4">
                    <li>En tu Google Sheet, ve a <strong>Extensiones &gt; Apps Script</strong>.</li>
                    <li>Copia el código de abajo y pégalo allí.</li>
                    <li>Haz clic en <strong>Implementar &gt; Nueva implementación</strong>.</li>
                    <li>Tipo: <strong>Aplicación web</strong> | Acceso: <strong>Cualquiera</strong>.</li>
                    <li>Copia la URL generada y pégala a la izquierda.</li>
                  </ol>
                </div>
                <div className="relative group">
                  <textarea 
                    readOnly 
                    className="w-full h-24 p-3 bg-slate-900 text-emerald-400 text-[10px] font-mono rounded-xl border border-slate-800 focus:outline-none"
                    value={scriptCode}
                  />
                  <button 
                    onClick={() => { navigator.clipboard.writeText(scriptCode); alert("Código copiado"); }}
                    className="absolute top-2 right-2 p-1 bg-slate-800 text-slate-400 hover:text-white rounded"
                  >
                    <FileJson size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Local Persistence Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <Database size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Almacenamiento Local</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl flex items-start space-x-3">
              <Info className="text-indigo-400 mt-0.5 shrink-0" size={18} />
              <p className="text-sm text-slate-600 leading-relaxed">
                Tus datos siempre se guardan primero localmente. La sincronización con Google Sheets es un respaldo adicional para tus dispositivos.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-emerald-600 font-medium text-sm">
              <ShieldCheck size={18} />
              <span>Privacidad Local-First</span>
            </div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <FileJson size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Respaldo Manual</h3>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => exportToJSON(data)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left"
            >
              <div>
                <p className="font-bold text-slate-800">Exportar Backup JSON</p>
                <p className="text-xs text-slate-500">Descarga tus registros en un archivo físico.</p>
              </div>
              <Download size={20} className="text-slate-400" />
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left"
            >
              <div>
                <p className="font-bold text-slate-800">Importar Backup JSON</p>
                <p className="text-xs text-slate-500">Carga un archivo previamente descargado.</p>
              </div>
              <Upload size={20} className="text-slate-400" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 lg:col-span-2">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Zona de Peligro</h3>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border border-rose-100 rounded-xl bg-rose-50/30">
            <div>
              <p className="font-bold text-slate-800">Borrar toda la información</p>
              <p className="text-sm text-slate-500">Esto eliminará los datos del navegador (no afectará a lo guardado en Sheets).</p>
            </div>
            <button 
              onClick={onReset}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              Borrar Localmente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
