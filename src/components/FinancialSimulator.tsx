import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getBudget, saveBudget, addAuditLog } from '../services/storage';
import type { BudgetItem } from '../types';

export default function FinancialSimulator() {
  const { user, addNotification } = useApp();
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [price, setPrice] = useState(62000);
  const [cost, setCost] = useState(49500);
  const [editing, setEditing] = useState(false);
  const [editBudget, setEditBudget] = useState<BudgetItem[]>([]);

  useEffect(() => {
    const b = getBudget();
    setBudget(b);
    setEditBudget(b.map((item) => ({ ...item })));
    const total = b.reduce((sum, item) => sum + item.amount, 0);
    setCost(total);
  }, []);

  const totalBudget = budget.reduce((sum, item) => sum + item.amount, 0);
  const margin = price - cost;
  const marginPct = ((price - cost) / price) * 100;

  const handleSaveBudget = () => {
    saveBudget(editBudget);
    setBudget(editBudget.map((item) => ({ ...item })));
    const total = editBudget.reduce((sum, item) => sum + item.amount, 0);
    setCost(total);
    setEditing(false);
    addAuditLog(
      user!.id,
      user!.name,
      'SAVE',
      'budget',
      'all',
      'Presupuesto actualizado'
    );
    addNotification('success', 'Presupuesto guardado correctamente');
  };

  const handleUpdateItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    setEditBudget(editBudget.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleRestore = () => {
    setPrice(62000);
    setCost(totalBudget);
    addNotification('info', 'Valores restablecidos');
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Simulador financiero</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Presupuesto */}
        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Presupuesto detallado</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-check-bg border border-border px-3 py-1.5 rounded-lg text-sm hover:border-accent transition-colors"
              >
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveBudget}
                  className="bg-accent text-dark-text px-3 py-1.5 rounded-lg text-sm font-bold hover:brightness-110 transition-all"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditBudget(budget.map((item) => ({ ...item })));
                  }}
                  className="bg-check-bg border border-border px-3 py-1.5 rounded-lg text-sm hover:border-accent transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              {editBudget.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={item.category}
                    onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value)}
                    className="col-span-4 px-3 py-2 bg-check-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleUpdateItem(item.id, 'amount', Number(e.target.value))}
                    className="col-span-3 px-3 py-2 bg-check-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    className="col-span-5 px-3 py-2 bg-check-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              ))}
              <div className="pt-3 border-t border-border">
                <div className="text-sm text-muted">Total:</div>
                <div className="text-2xl font-extrabold text-accent">
                  {formatCurrency(editBudget.reduce((sum, item) => sum + item.amount, 0))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <table className="w-full">
                <tbody>
                  {budget.map((item) => (
                    <tr key={item.id} className="border-b border-border/50">
                      <td className="py-3 text-sm">{item.category}</td>
                      <td className="py-3 text-sm text-right font-medium">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-3 text-sm font-bold">Total</td>
                    <td className="py-3 text-right text-xl font-extrabold text-accent">
                      {formatCurrency(totalBudget)}
                    </td>
                  </tr>
                </tfoot>
              </table>
              <p className="text-xs text-muted mt-3">
                Importes indicativos, sin IVA. Editables en tiempo real.
              </p>
            </div>
          )}
        </div>

        {/* Simulador */}
        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Simulador de margen</h2>

          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm">
                Precio comercial{' '}
                <span className="float-right text-ink font-bold">
                  {formatCurrency(price)}
                </span>
              </label>
              <input
                type="range"
                min={35000}
                max={85000}
                step={500}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">
                Coste directo{' '}
                <span className="float-right text-ink font-bold">
                  {formatCurrency(cost)}
                </span>
              </label>
              <input
                type="range"
                min={35000}
                max={75000}
                step={500}
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="pt-4 border-t border-border">
              <div className="text-xs text-muted mb-2">Margen bruto hipotético</div>
              <div
                className={`text-4xl font-extrabold ${
                  margin < 0 ? 'text-red-400' : 'text-accent'
                }`}
              >
                {formatCurrency(margin)}
              </div>
              <p className="text-sm text-muted mt-2">
                {marginPct.toFixed(1).replace('.', ',')} % sobre ventas, antes de gastos generales e impuestos
              </p>
            </div>

            <div className="border-l-3 border-warn pl-4 py-3 bg-notice-bg rounded-r-xl">
              <p className="text-sm text-muted">
                El margen bruto no es beneficio neto. El precio solo se negociará tras validar el alcance y el interés de IREN.
              </p>
            </div>

            <button
              onClick={handleRestore}
              className="bg-check-bg border border-border px-4 py-2.5 rounded-xl font-bold hover:border-accent transition-colors"
            >
              Restablecer valores
            </button>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Resumen ejecutivo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-check-bg border border-border rounded-xl p-4">
            <div className="text-xs text-muted mb-1">Inversión total</div>
            <div className="text-2xl font-extrabold">{formatCurrency(cost)}</div>
          </div>
          <div className="bg-check-bg border border-border rounded-xl p-4">
            <div className="text-xs text-muted mb-1">Precio objetivo</div>
            <div className="text-2xl font-extrabold text-accent">{formatCurrency(price)}</div>
          </div>
          <div className="bg-check-bg border border-border rounded-xl p-4">
            <div className="text-xs text-muted mb-1">Margen esperado</div>
            <div className={`text-2xl font-extrabold ${margin < 0 ? 'text-red-400' : 'text-green-400'}`}>
              {formatCurrency(margin)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
