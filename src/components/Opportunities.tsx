import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  getOpportunities,
  saveOpportunity,
  deleteOpportunity,
  generateId,
  addAuditLog,
} from '../services/storage';
import type { Opportunity } from '../types';

export default function Opportunities() {
  const { user, addNotification } = useApp();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | Opportunity['status']>('all');

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = () => {
    setOpportunities(getOpportunities());
  };

  const handleNew = () => {
    const newOpp: Opportunity = {
      id: generateId('opp'),
      companyName: '',
      contactPerson: '',
      contactEmail: '',
      description: '',
      status: 'new',
      criteria: {
        need: false,
        decisionMaker: false,
        dataAvailable: false,
        technicalFeasibility: false,
        budget: false,
        irenFit: false,
        nextStep: false,
      },
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user!.id,
    };
    setEditing(newOpp);
    setShowForm(true);
  };

  const handleEdit = (opp: Opportunity) => {
    setEditing({ ...opp });
    setShowForm(true);
  };

  const handleSave = (opp: Opportunity) => {
    saveOpportunity(opp);
    addAuditLog(
      user!.id,
      user!.name,
      'SAVE',
      'opportunity',
      opp.id,
      `Oportunidad guardada: ${opp.companyName}`
    );
    addNotification('success', 'Oportunidad guardada correctamente');
    loadOpportunities();
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (opp: Opportunity) => {
    if (!confirm(`¿Eliminar la oportunidad "${opp.companyName}"?`)) return;
    deleteOpportunity(opp.id);
    addAuditLog(
      user!.id,
      user!.name,
      'DELETE',
      'opportunity',
      opp.id,
      `Oportunidad eliminada: ${opp.companyName}`
    );
    addNotification('success', 'Oportunidad eliminada');
    loadOpportunities();
  };

  const filtered = filter === 'all' ? opportunities : opportunities.filter((o) => o.status === filter);

  if (showForm && editing) {
    return (
      <OpportunityForm
        opportunity={editing}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditing(null);
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Oportunidades</h1>
        <button
          onClick={handleNew}
          className="bg-accent text-dark-text px-4 py-2.5 rounded-xl font-bold hover:brightness-110 transition-all"
        >
          + Nueva oportunidad
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-6">
        {(['all', 'new', 'in_progress', 'qualified', 'completed', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === status
                ? 'bg-accent text-dark-text'
                : 'bg-check-bg border border-border text-muted hover:border-accent/40'
            }`}
          >
            {status === 'all' ? 'Todas' : status === 'new' ? 'Nuevas' : status === 'in_progress' ? 'En progreso' : status === 'qualified' ? 'Cualificadas' : status === 'completed' ? 'Completadas' : 'Rechazadas'}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-12 text-center">
          <p className="text-muted">No hay oportunidades {filter !== 'all' ? 'con este estado' : 'registradas'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((opp) => (
            <div
              key={opp.id}
              className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6 hover:border-accent/40 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{opp.companyName}</h3>
                  <p className="text-sm text-muted">
                    {opp.contactPerson} · {opp.contactEmail}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(opp)}
                    className="bg-check-bg border border-border px-3 py-1.5 rounded-lg text-sm hover:border-accent transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(opp)}
                    className="bg-check-bg border border-border px-3 py-1.5 rounded-lg text-sm text-red-400 hover:border-red-400 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted mb-3">{opp.description}</p>
              <div className="flex gap-2 flex-wrap">
                <StatusBadge status={opp.status} />
                <span className="text-xs text-muted">
                  Creada: {new Date(opp.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
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

function OpportunityForm({
  opportunity,
  onSave,
  onCancel,
}: {
  opportunity: Opportunity;
  onSave: (opp: Opportunity) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Opportunity>(opportunity);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.companyName.trim()) errs.companyName = 'Nombre requerido';
    if (!form.contactPerson.trim()) errs.contactPerson = 'Contacto requerido';
    if (!form.contactEmail.trim()) errs.contactEmail = 'Email requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail))
      errs.contactEmail = 'Email inválido';
    if (!form.description.trim()) errs.description = 'Descripción requerida';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(form);
    }
  };

  const updateField = <K extends keyof Opportunity>(key: K, value: Opportunity[K]) => {
    setForm({ ...form, [key]: value });
  };

  const updateCriterion = (key: keyof Opportunity['criteria'], value: boolean) => {
    setForm({
      ...form,
      criteria: { ...form.criteria, [key]: value },
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {opportunity.companyName ? 'Editar oportunidad' : 'Nueva oportunidad'}
        </h1>
        <button
          onClick={onCancel}
          className="bg-check-bg border border-border px-4 py-2.5 rounded-xl font-bold hover:border-accent transition-colors"
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Información general</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre de la empresa *
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                className="w-full px-4 py-3 bg-check-bg border border-border rounded-xl text-ink focus:outline-none focus:border-accent transition-colors"
              />
              {errors.companyName && (
                <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Persona de contacto *
              </label>
              <input
                type="text"
                value={form.contactPerson}
                onChange={(e) => updateField('contactPerson', e.target.value)}
                className="w-full px-4 py-3 bg-check-bg border border-border rounded-xl text-ink focus:outline-none focus:border-accent transition-colors"
              />
              {errors.contactPerson && (
                <p className="text-red-400 text-xs mt-1">{errors.contactPerson}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Email de contacto *
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                className="w-full px-4 py-3 bg-check-bg border border-border rounded-xl text-ink focus:outline-none focus:border-accent transition-colors"
              />
              {errors.contactEmail && (
                <p className="text-red-400 text-xs mt-1">{errors.contactEmail}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value as Opportunity['status'])}
                className="w-full px-4 py-3 bg-check-bg border border-border rounded-xl text-ink focus:outline-none focus:border-accent transition-colors"
              >
                <option value="new">Nueva</option>
                <option value="in_progress">En progreso</option>
                <option value="qualified">Cualificada</option>
                <option value="completed">Completada</option>
                <option value="rejected">Rechazada</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Descripción *</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-check-bg border border-border rounded-xl text-ink focus:outline-none focus:border-accent transition-colors resize-none"
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">{errors.description}</p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Criterios de cualificación</h2>
          <div className="space-y-3">
            <CriterionCheckbox
              label="Necesidad real documentada"
              checked={form.criteria.need}
              onChange={(v) => updateCriterion('need', v)}
            />
            <CriterionCheckbox
              label="Responsable identificado"
              checked={form.criteria.decisionMaker}
              onChange={(v) => updateCriterion('decisionMaker', v)}
            />
            <CriterionCheckbox
              label="Datos disponibles"
              checked={form.criteria.dataAvailable}
              onChange={(v) => updateCriterion('dataAvailable', v)}
            />
            <CriterionCheckbox
              label="Viabilidad técnica"
              checked={form.criteria.technicalFeasibility}
              onChange={(v) => updateCriterion('technicalFeasibility', v)}
            />
            <CriterionCheckbox
              label="Presupuesto confirmado"
              checked={form.criteria.budget}
              onChange={(v) => updateCriterion('budget', v)}
            />
            <CriterionCheckbox
              label="Encaje con IREN"
              checked={form.criteria.irenFit}
              onChange={(v) => updateCriterion('irenFit', v)}
            />
            <CriterionCheckbox
              label="Próximo paso definido"
              checked={form.criteria.nextStep}
              onChange={(v) => updateCriterion('nextStep', v)}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Notas adicionales</h2>
          <textarea
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-check-bg border border-border rounded-xl text-ink focus:outline-none focus:border-accent transition-colors resize-none"
            placeholder="Observaciones, contexto, restricciones..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-accent text-dark-text px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all"
          >
            Guardar oportunidad
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-check-bg border border-border px-6 py-3 rounded-xl font-bold hover:border-accent transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function CriterionCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 p-3 border border-border rounded-xl bg-check-bg cursor-pointer hover:border-accent/40 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}
