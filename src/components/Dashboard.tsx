import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getOpportunities, getBudget } from '../services/storage';
import type { Opportunity, BudgetItem } from '../types';

export default function Dashboard() {
  const { user } = useApp();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [budget, setBudget] = useState<BudgetItem[]>([]);

  useEffect(() => {
    setOpportunities(getOpportunities());
    setBudget(getBudget());
  }, []);

  const totalBudget = budget.reduce((sum, item) => sum + item.amount, 0);
  const qualifiedCount = opportunities.filter((o) => {
    const c = o.criteria;
    return c.need && c.decisionMaker && c.dataAvailable && c.technicalFeasibility && c.budget && c.irenFit && c.nextStep;
  }).length;
  const inProgressCount = opportunities.filter((o) => o.status === 'in_progress').length;
  const newCount = opportunities.filter((o) => o.status === 'new').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Panel de control
        </h1>
        <p className="text-muted mt-2">
          Bienvenido, {user?.name} · {user?.role === 'admin' ? 'Administrador' : 'Analista'}
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Oportunidades totales"
          value={opportunities.length.toString()}
          color="text-accent"
        />
        <MetricCard
          label="Nuevas"
          value={newCount.toString()}
          color="text-blue-400"
        />
        <MetricCard
          label="En progreso"
          value={inProgressCount.toString()}
          color="text-yellow-400"
        />
        <MetricCard
          label="Cualificadas (7/7)"
          value={qualifiedCount.toString()}
          color="text-green-400"
        />
      </div>

      {/* Presupuesto */}
      <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Presupuesto del piloto</h2>
          <div className="text-2xl font-extrabold text-accent">
            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalBudget)}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {budget.map((item) => (
            <div key={item.id} className="bg-check-bg border border-border rounded-xl p-3">
              <div className="text-xs text-muted mb-1">{item.category}</div>
              <div className="text-lg font-bold">
                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(item.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Oportunidades recientes */}
      <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Oportunidades recientes</h2>
        {opportunities.length === 0 ? (
          <p className="text-muted text-center py-8">No hay oportunidades registradas</p>
        ) : (
          <div className="space-y-3">
            {opportunities.slice(0, 5).map((opp) => (
              <div key={opp.id} className="bg-check-bg border border-border rounded-xl p-4 hover:border-accent/40 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold">{opp.companyName}</h3>
                    <p className="text-sm text-muted">{opp.contactPerson} · {opp.contactEmail}</p>
                  </div>
                  <StatusBadge status={opp.status} />
                </div>
                <p className="text-sm text-muted">{opp.description}</p>
                <div className="flex gap-2 mt-3">
                  <CriterionBadge active={opp.criteria.need} label="Necesidad" />
                  <CriterionBadge active={opp.criteria.decisionMaker} label="Decisor" />
                  <CriterionBadge active={opp.criteria.dataAvailable} label="Datos" />
                  <CriterionBadge active={opp.criteria.technicalFeasibility} label="Técnica" />
                  <CriterionBadge active={opp.criteria.budget} label="Presupuesto" />
                  <CriterionBadge active={opp.criteria.irenFit} label="IREN" />
                  <CriterionBadge active={opp.criteria.nextStep} label="Siguiente" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6">
      <div className="text-xs text-muted mb-2">{label}</div>
      <div className={`text-4xl font-extrabold tracking-tight ${color}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: Opportunity['status'] }) {
  const colors: Record<Opportunity['status'], string> = {
    new: 'bg-blue-500/20 text-blue-300',
    qualified: 'bg-green-500/20 text-green-300',
    in_progress: 'bg-yellow-500/20 text-yellow-300',
    completed: 'bg-accent/20 text-accent',
    rejected: 'bg-red-500/20 text-red-300',
  };

  const labels: Record<Opportunity['status'], string> = {
    new: 'Nueva',
    qualified: 'Cualificada',
    in_progress: 'En progreso',
    completed: 'Completada',
    rejected: 'Rechazada',
  };

  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

function CriterionBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        active ? 'bg-accent/20 text-accent' : 'bg-border/50 text-muted'
      }`}
    >
      {label}
    </span>
  );
}
