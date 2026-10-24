import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportAllData, purgeAllData, addAuditLog } from '../services/storage';

export default function Settings() {
  const { user, addNotification } = useApp();
  const [confirmPurge, setConfirmPurge] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  const handleExport = () => {
    const data = exportAllData();
    let content = data;
    let filename = 'datos_piloto_iren.json';
    let mimeType = 'application/json';

    if (exportFormat === 'csv') {
      const parsed = JSON.parse(data);
      const rows = [['Tipo', 'ID', 'Nombre/Descripción', 'Estado', 'Fecha']];
      
      // Oportunidades
      parsed.opportunities?.forEach((opp: any) => {
        rows.push([
          'Oportunidad',
          opp.id,
          `${opp.companyName} - ${opp.contactPerson}`,
          opp.status,
          new Date(opp.createdAt).toLocaleDateString('es-ES'),
        ]);
      });

      // Presupuesto
      parsed.budget?.forEach((item: any) => {
        rows.push([
          'Presupuesto',
          item.id,
          `${item.category}: ${item.description}`,
          `${item.amount}€`,
          '',
        ]);
      });

      content = rows.map((r) => r.join(';')).join('\n');
      filename = 'datos_piloto_iren.csv';
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);

    addAuditLog(
      user!.id,
      user!.name,
      'EXPORT',
      'data',
      'all',
      `Datos exportados en formato ${exportFormat.toUpperCase()}`
    );
    addNotification('success', `Datos exportados en formato ${exportFormat.toUpperCase()}`);
  };

  const handlePurge = () => {
    if (!confirmPurge) {
      setConfirmPurge(true);
      return;
    }
    purgeAllData();
    addAuditLog(
      user!.id,
      user!.name,
      'DELETE',
      'system',
      'all',
      'Todos los datos han sido eliminados (purga RGPD)'
    );
    addNotification('success', 'Todos los datos han sido eliminados');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Configuración y datos</h1>

      {/* Exportación */}
      <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Exportar datos</h2>
        <p className="text-muted text-sm mb-4">
          Descarga todos los datos del sistema en el formato que prefieras. Los datos incluyen oportunidades, presupuesto y registro de auditoría.
        </p>
        <div className="flex gap-3 items-center mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="format"
              checked={exportFormat === 'json'}
              onChange={() => setExportFormat('json')}
              className="accent-accent"
            />
            <span className="text-sm">JSON</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="format"
              checked={exportFormat === 'csv'}
              onChange={() => setExportFormat('csv')}
              className="accent-accent"
            />
            <span className="text-sm">CSV</span>
          </label>
        </div>
        <button
          onClick={handleExport}
          className="bg-accent text-dark-text px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all"
        >
          Exportar datos
        </button>
      </div>

      {/* Información RGPD */}
      <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Protección de datos (RGPD)</h2>
        <div className="space-y-3 text-sm text-muted">
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold">✓</span>
            <p>Los datos se almacenan exclusivamente en tu navegador (localStorage)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold">✓</span>
            <p>No se envían datos a servidores externos</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold">✓</span>
            <p>Todas las acciones se registran en el log de auditoría</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold">✓</span>
            <p>Puedes exportar todos tus datos en cualquier momento</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold">✓</span>
            <p>Puedes eliminar todos los datos permanentemente</p>
          </div>
        </div>
      </div>

      {/* Purga de datos */}
      <div className="bg-gradient-to-br from-card-from to-card-to border border-red-500/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 text-red-400">Eliminar todos los datos</h2>
        <p className="text-muted text-sm mb-4">
          Esta acción eliminará permanentemente todas las oportunidades, presupuesto y registros de auditoría. No se puede deshacer.
        </p>
        {confirmPurge ? (
          <div className="border-l-3 border-red-500 pl-4 py-3 bg-red-500/10 rounded-r-xl">
            <p className="text-sm text-red-300 mb-3">
              <strong>¿Estás seguro?</strong> Esta acción es irreversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handlePurge}
                className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                Sí, eliminar todo
              </button>
              <button
                onClick={() => setConfirmPurge(false)}
                className="bg-check-bg border border-border px-4 py-2 rounded-xl font-bold hover:border-accent transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handlePurge}
            className="bg-red-500/20 border border-red-500/50 text-red-300 px-6 py-3 rounded-xl font-bold hover:bg-red-500/30 transition-colors"
          >
            Eliminar todos los datos
          </button>
        )}
      </div>
    </div>
  );
}
