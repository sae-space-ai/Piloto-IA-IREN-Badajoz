import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';

/* ============================
   TYPES
   ============================ */
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface Case {
  id: string;
  title: string;
  client: string;
  sector: string;
  description: string;
  status: 'draft' | 'review' | 'active' | 'archived';
  priority: 'low' | 'medium' | 'high';
  score: number;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface AuditEntry {
  id: string;
  ts: string;
  user: string;
  action: string;
  detail: string;
}

interface Notif {
  id: string;
  type: 'ok' | 'err' | 'info';
  msg: string;
}

/* ============================
   STORAGE
   ============================ */
const K = {
  U: '_te_users',
  C: '_te_current',
  P: '_te_projects',
  A: '_te_audit',
};

function load<T>(k: string, fb: T): T {
  try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; }
}
function save<T>(k: string, v: T) { localStorage.setItem(k, JSON.stringify(v)); }

const USERS: User[] = [
  { id: 'u1', email: 'admin@techeval.pro', name: 'Admin', role: 'admin' },
  { id: 'u2', email: 'user@techeval.pro', name: 'Analista', role: 'user' },
];

const SEED: Case[] = [
  { id: 'c1', title: 'Optimización proceso documental', client: 'Sector Logística', sector: 'Logística', description: 'Evaluación de viabilidad para automatización de clasificación.', status: 'active', priority: 'high', score: 78, tags: ['automatización', 'documental'], notes: '', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'c2', title: 'Análisis predictivo inventario', client: 'Sector Retail', sector: 'Retail', description: 'Modelo de predicción de demanda estacional.', status: 'review', priority: 'medium', score: 62, tags: ['predictivo', 'inventario'], notes: '', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'c3', title: 'Control calidad visual', client: 'Sector Manufactura', sector: 'Manufactura', description: 'Detección de defectos mediante visión artificial.', status: 'draft', priority: 'low', score: 45, tags: ['visión', 'calidad'], notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

function auth(email: string, pass: string): User | null {
  if (pass !== 'demo1234') return null;
  return USERS.find(u => u.email === email) || null;
}

function log(uid: string, uname: string, action: string, detail: string) {
  const entries = load<AuditEntry[]>(K.A, []);
  entries.unshift({ id: `a${Date.now()}`, ts: new Date().toISOString(), user: uname, action, detail });
  if (entries.length > 200) entries.length = 200;
  save(K.A, entries);
}

/* ============================
   CONTEXT
   ============================ */
interface Ctx {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  notify: (type: Notif['type'], msg: string) => void;
  notifs: Notif[];
  dismiss: (id: string) => void;
}
const AppCtx = createContext<Ctx>(null!);
const useApp = () => useContext(AppCtx);

function Provider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [notifs, setNotifs] = useState<Notif[]>([]);

  useEffect(() => { setUser(load<User | null>(K.C, null)); }, []);

  const login = useCallback((u: User) => { setUser(u); save(K.C, u); log(u.id, u.name, 'LOGIN', u.email); }, []);
  const logout = useCallback(() => { if (user) log(user.id, user.name, 'LOGOUT', user.email); setUser(null); save(K.C, null); }, [user]);
  const notify = useCallback((type: Notif['type'], msg: string) => {
    const n: Notif = { id: `n${Date.now()}`, type, msg };
    setNotifs(p => [...p, n]);
    setTimeout(() => setNotifs(p => p.filter(x => x.id !== n.id)), 4000);
  }, []);
  const dismiss = useCallback((id: string) => setNotifs(p => p.filter(x => x.id !== id)), []);

  return <AppCtx.Provider value={{ user, login, logout, notify, notifs, dismiss }}>{children}</AppCtx.Provider>;
}

/* ============================
   HELPERS
   ============================ */
const uid = (p: string) => `${p}${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
const fmt = (n: number) => new Intl.NumberFormat('es-ES').format(n);
const fdate = (s: string) => new Date(s).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

/* ============================
   LOGIN
   ============================ */
function Login() {
  const { login, notify } = useApp();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!email || !pass) { setErr('Completa todos los campos'); return; }
    setLoading(true);
    setTimeout(() => {
      const u = auth(email, pass);
      if (u) { login(u); notify('ok', `Sesión iniciada`); }
      else setErr('Credenciales no válidas');
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <svg className="w-6 h-6 text-dark-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">TechEval Pro</h1>
          <p className="text-muted text-sm mt-1">Plataforma de evaluación técnica</p>
        </div>

        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 bg-check-bg border border-border rounded-xl text-ink text-sm placeholder-muted focus:border-accent focus:outline-none" placeholder="usuario@techeval.pro" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Contraseña</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full px-3 py-2.5 bg-check-bg border border-border rounded-xl text-ink text-sm placeholder-muted focus:border-accent focus:outline-none" placeholder="••••••••" disabled={loading} />
            </div>
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <button type="submit" disabled={loading} className="w-full bg-accent text-dark-text py-2.5 rounded-xl font-bold text-sm hover:brightness-110 disabled:opacity-50">
              {loading ? 'Verificando...' : 'Acceder'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted mt-6">v2.4.1 · Datos locales</p>
      </div>
    </div>
  );
}

/* ============================
   DASHBOARD
   ============================ */
function Dashboard({ onNav }: { onNav: (p: string) => void }) {
  const cases = load<Case[]>(K.P, SEED);
  const total = cases.length;
  const active = cases.filter(c => c.status === 'active').length;
  const avgScore = total ? Math.round(cases.reduce((s, c) => s + c.score, 0) / total) : 0;
  const high = cases.filter(c => c.priority === 'high').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Panel general</h1>
        <p className="text-muted text-sm mt-1">Resumen de evaluaciones en curso</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total casos" value={total} color="text-accent" />
        <StatCard label="Activos" value={active} color="text-blue-400" />
        <StatCard label="Puntuación media" value={avgScore} color="text-yellow-400" suffix="/100" />
        <StatCard label="Alta prioridad" value={high} color="text-red-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Casos recientes</h2>
            <button onClick={() => onNav('cases')} className="text-accent text-xs font-medium hover:underline">Ver todos →</button>
          </div>
          {cases.slice(0, 4).map(c => (
            <div key={c.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{c.title}</div>
                <div className="text-xs text-muted">{c.client}</div>
              </div>
              <ScoreBadge score={c.score} />
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-5">
          <h2 className="font-bold mb-4">Distribución por estado</h2>
          {(['draft', 'review', 'active', 'archived'] as const).map(s => {
            const count = cases.filter(c => c.status === s).length;
            const pct = total ? (count / total) * 100 : 0;
            const labels: Record<string, string> = { draft: 'Borrador', review: 'En revisión', active: 'Activo', archived: 'Archivado' };
            return (
              <div key={s} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">{labels[s]}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-2 bg-border/50 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, suffix }: { label: string; value: number; color: string; suffix?: string }) {
  return (
    <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-4">
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className={`text-2xl md:text-3xl font-extrabold tracking-tight ${color}`}>
        {fmt(value)}{suffix && <span className="text-sm text-muted font-normal">{suffix}</span>}
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? 'text-green-400 bg-green-500/15' : score >= 50 ? 'text-yellow-400 bg-yellow-500/15' : 'text-red-400 bg-red-500/15';
  return <span className={`text-xs font-bold px-2 py-1 rounded-lg ${color}`}>{score}</span>;
}

/* ============================
   CASES LIST + FORM
   ============================ */
function Cases() {
  const { user, notify } = useApp();
  const [cases, setCases] = useState<Case[]>([]);
  const [editing, setEditing] = useState<Case | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => { setCases(load<Case[]>(K.P, SEED)); }, []);

  const reload = () => setCases(load<Case[]>(K.P, SEED));

  const handleSave = (c: Case) => {
    const all = load<Case[]>(K.P, SEED);
    const idx = all.findIndex(x => x.id === c.id);
    c.updatedAt = new Date().toISOString();
    if (idx >= 0) all[idx] = c; else all.push(c);
    save(K.P, all);
    log(user!.id, user!.name, idx >= 0 ? 'UPDATE' : 'CREATE', c.title);
    notify('ok', idx >= 0 ? 'Caso actualizado' : 'Caso creado');
    reload();
    setEditing(null);
  };

  const handleDelete = (c: Case) => {
    if (!confirm(`¿Eliminar "${c.title}"?`)) return;
    const all = load<Case[]>(K.P, SEED).filter(x => x.id !== c.id);
    save(K.P, all);
    log(user!.id, user!.name, 'DELETE', c.title);
    notify('ok', 'Caso eliminado');
    reload();
  };

  const handleNew = () => {
    setEditing({
      id: uid('c'), title: '', client: '', sector: '', description: '',
      status: 'draft', priority: 'medium', score: 0, tags: [], notes: '',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
  };

  const filtered = cases.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search && !`${c.title} ${c.client} ${c.sector}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (editing) return <CaseForm caseData={editing} onSave={handleSave} onCancel={() => setEditing(null)} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Evaluaciones</h1>
        <button onClick={handleNew} className="bg-accent text-dark-text px-4 py-2 rounded-xl text-sm font-bold hover:brightness-110">+ Nuevo caso</button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="flex-1 px-3 py-2 bg-check-bg border border-border rounded-xl text-sm text-ink placeholder-muted focus:border-accent focus:outline-none" />
        <div className="flex gap-1.5 flex-wrap">
          {[['all', 'Todos'], ['draft', 'Borrador'], ['review', 'Revisión'], ['active', 'Activo'], ['archived', 'Archivado']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} className={`px-3 py-2 rounded-xl text-xs font-medium ${filter === v ? 'bg-accent text-dark-text' : 'bg-check-bg border border-border text-muted hover:border-accent/40'}`}>{l}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-12 text-center text-muted text-sm">Sin resultados</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-4 hover:border-accent/30 transition-colors">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm truncate">{c.title}</h3>
                    <StatusPill status={c.status} />
                    <PriorityDot priority={c.priority} />
                  </div>
                  <p className="text-xs text-muted mb-2">{c.client} · {c.sector}</p>
                  <p className="text-xs text-muted line-clamp-2">{c.description}</p>
                  {c.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {c.tags.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-border/50 text-muted">{t}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ScoreBadge score={c.score} />
                  <div className="flex gap-1">
                    <button onClick={() => setEditing({ ...c })} className="text-xs px-2 py-1 rounded-lg bg-check-bg border border-border hover:border-accent/40">Editar</button>
                    <button onClick={() => handleDelete(c)} className="text-xs px-2 py-1 rounded-lg bg-check-bg border border-border text-red-400 hover:border-red-400/50">✕</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: Case['status'] }) {
  const m: Record<string, string> = { draft: 'bg-gray-500/20 text-gray-300', review: 'bg-yellow-500/20 text-yellow-300', active: 'bg-green-500/20 text-green-300', archived: 'bg-border/50 text-muted' };
  const l: Record<string, string> = { draft: 'Borrador', review: 'Revisión', active: 'Activo', archived: 'Archivado' };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${m[status]}`}>{l[status]}</span>;
}

function PriorityDot({ priority }: { priority: Case['priority'] }) {
  const c: Record<string, string> = { low: 'bg-blue-400', medium: 'bg-yellow-400', high: 'bg-red-400' };
  return <span className={`w-2 h-2 rounded-full ${c[priority]}`} title={priority} />;
}

function CaseForm({ caseData, onSave, onCancel }: { caseData: Case; onSave: (c: Case) => void; onCancel: () => void }) {
  const [form, setForm] = useState(caseData);
  const [tagInput, setTagInput] = useState('');
  const [errs, setErrs] = useState<Record<string, string>>({});

  const set = <K extends keyof Case>(k: K, v: Case[K]) => setForm(f => ({ ...f, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Requerido';
    if (!form.client.trim()) e.client = 'Requerido';
    if (!form.description.trim()) e.description = 'Requerido';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSave(form);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">{caseData.title ? 'Editar caso' : 'Nuevo caso'}</h1>
        <button onClick={onCancel} className="text-sm text-muted hover:text-ink">← Volver</button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Título *" err={errs.title}>
              <input value={form.title} onChange={e => set('title', e.target.value)} className="input" />
            </Field>
            <Field label="Cliente / Sector *" err={errs.client}>
              <input value={form.client} onChange={e => set('client', e.target.value)} className="input" />
            </Field>
            <Field label="Sector">
              <select value={form.sector} onChange={e => set('sector', e.target.value)} className="input">
                <option value="">Seleccionar...</option>
                <option>Logística</option><option>Retail</option><option>Manufactura</option>
                <option>Salud</option><option>Energía</option><option>Finanzas</option><option>Otro</option>
              </select>
            </Field>
            <Field label="Estado">
              <select value={form.status} onChange={e => set('status', e.target.value as Case['status'])} className="input">
                <option value="draft">Borrador</option><option value="review">En revisión</option>
                <option value="active">Activo</option><option value="archived">Archivado</option>
              </select>
            </Field>
            <Field label="Prioridad">
              <select value={form.priority} onChange={e => set('priority', e.target.value as Case['priority'])} className="input">
                <option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option>
              </select>
            </Field>
            <Field label={`Puntuación: ${form.score}/100`}>
              <input type="range" min={0} max={100} value={form.score} onChange={e => set('score', +e.target.value)} className="w-full" />
            </Field>
          </div>
          <Field label="Descripción *" err={errs.description}>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="input resize-none" />
          </Field>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Etiquetas</label>
            <div className="flex gap-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Añadir etiqueta..." className="input flex-1" />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-check-bg border border-border rounded-xl text-sm hover:border-accent/40">+</button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {form.tags.map(t => (
                  <span key={t} className="text-xs px-2 py-1 rounded-lg bg-accent/15 text-accent flex items-center gap-1">
                    {t}
                    <button type="button" onClick={() => set('tags', form.tags.filter(x => x !== t))} className="hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <Field label="Notas">
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="input resize-none" placeholder="Observaciones internas..." />
          </Field>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="bg-accent text-dark-text px-5 py-2.5 rounded-xl text-sm font-bold hover:brightness-110">Guardar</button>
          <button type="button" onClick={onCancel} className="bg-check-bg border border-border px-5 py-2.5 rounded-xl text-sm font-bold hover:border-accent/40">Cancelar</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, err, children }: { label: string; err?: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
      {children}
      {err && <p className="text-red-400 text-[10px] mt-1">{err}</p>}
    </div>
  );
}

/* ============================
   AUDIT LOG
   ============================ */
function AuditView() {
  const entries = load<AuditEntry[]>(K.A, []);
  const [search, setSearch] = useState('');

  const filtered = search
    ? entries.filter(e => `${e.user} ${e.action} ${e.detail}`.toLowerCase().includes(search.toLowerCase()))
    : entries;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Registro de actividad</h1>
        <span className="text-xs text-muted">{filtered.length} entradas</span>
      </div>

      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrar..." className="w-full px-3 py-2 bg-check-bg border border-border rounded-xl text-sm text-ink placeholder-muted focus:border-accent focus:outline-none mb-4" />

      {filtered.length === 0 ? (
        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-12 text-center text-muted text-sm">Sin registros</div>
      ) : (
        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs text-muted font-medium">Fecha</th>
                  <th className="text-left py-3 px-4 text-xs text-muted font-medium">Usuario</th>
                  <th className="text-left py-3 px-4 text-xs text-muted font-medium">Acción</th>
                  <th className="text-left py-3 px-4 text-xs text-muted font-medium">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map(e => (
                  <tr key={e.id} className="border-b border-border/30 hover:bg-check-bg/30">
                    <td className="py-2.5 px-4 text-xs text-muted whitespace-nowrap">{new Date(e.ts).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-2.5 px-4 text-xs">{e.user}</td>
                    <td className="py-2.5 px-4"><span className="text-[10px] px-2 py-0.5 rounded bg-accent/15 text-accent font-bold">{e.action}</span></td>
                    <td className="py-2.5 px-4 text-xs text-muted max-w-xs truncate">{e.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================
   SETTINGS
   ============================ */
function SettingsView() {
  const { user, notify, logout } = useApp();
  const [confirm, setConfirm] = useState(false);

  const exportData = () => {
    const data = {
      exported: new Date().toISOString(),
      cases: load<Case[]>(K.P, []),
      audit: load<AuditEntry[]>(K.A, []).slice(0, 50),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `techeval_export_${Date.now()}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    log(user!.id, user!.name, 'EXPORT', 'Datos exportados');
    notify('ok', 'Datos exportados');
  };

  const purge = () => {
    Object.values(K).forEach(k => localStorage.removeItem(k));
    log(user!.id, user!.name, 'PURGE', 'Datos eliminados');
    notify('info', 'Datos eliminados');
    setTimeout(() => logout(), 800);
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">Configuración</h1>

      <div className="space-y-4">
        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-5">
          <h2 className="font-bold mb-3">Cuenta</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Nombre</span><span>{user?.name}</span></div>
            <div className="flex justify-between"><span className="text-muted">Email</span><span>{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-muted">Rol</span><span className="capitalize">{user?.role}</span></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-5">
          <h2 className="font-bold mb-3">Datos</h2>
          <p className="text-xs text-muted mb-3">Los datos se almacenan localmente en este navegador. No se transmiten a servidores externos.</p>
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportData} className="bg-accent text-dark-text px-4 py-2 rounded-xl text-sm font-bold hover:brightness-110">Exportar datos</button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-card-from to-card-to border border-red-500/30 rounded-2xl p-5">
          <h2 className="font-bold mb-3 text-red-400">Eliminar datos</h2>
          <p className="text-xs text-muted mb-3">Esta acción eliminará permanentemente todos los datos almacenados localmente.</p>
          {confirm ? (
            <div className="flex gap-2">
              <button onClick={purge} className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold">Confirmar eliminación</button>
              <button onClick={() => setConfirm(false)} className="bg-check-bg border border-border px-4 py-2 rounded-xl text-sm">Cancelar</button>
            </div>
          ) : (
            <button onClick={() => setConfirm(true)} className="bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-500/30">Eliminar todo</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================
   LAYOUT
   ============================ */
function Shell({ page, onNav, children }: { page: string; onNav: (p: string) => void; children: ReactNode }) {
  const { user, logout, notifs, dismiss } = useApp();
  const [mob, setMob] = useState(false);

  const items = [
    { id: 'dashboard', label: 'Panel', icon: '◫' },
    { id: 'cases', label: 'Evaluaciones', icon: '◉' },
    { id: 'audit', label: 'Actividad', icon: '☰' },
    { id: 'settings', label: 'Config.', icon: '⚙' },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-panel/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[1180px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-dark-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <span className="font-bold tracking-tight hidden sm:inline">TechEval Pro</span>
          </div>

          <nav className="hidden md:flex gap-1">
            {items.map(it => (
              <button key={it.id} onClick={() => onNav(it.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${page === it.id ? 'bg-accent text-dark-text' : 'text-muted hover:text-ink hover:bg-check-bg'}`}>
                <span className="mr-1.5">{it.icon}</span>{it.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-xs text-muted">{user?.name}</span>
            <button onClick={logout} className="bg-check-bg border border-border px-2.5 py-1.5 rounded-lg text-xs hover:border-accent/40">Salir</button>
            <button onClick={() => setMob(!mob)} className="md:hidden bg-check-bg border border-border p-1.5 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
        {mob && (
          <nav className="md:hidden border-t border-border px-4 py-2 flex flex-col gap-1">
            {items.map(it => (
              <button key={it.id} onClick={() => { onNav(it.id); setMob(false); }} className={`px-3 py-2 rounded-lg text-sm text-left ${page === it.id ? 'bg-accent text-dark-text' : 'text-muted'}`}>
                <span className="mr-2">{it.icon}</span>{it.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* Notifications */}
      <div className="fixed top-16 right-4 z-50 space-y-2 max-w-xs">
        {notifs.map(n => (
          <div key={n.id} className={`border rounded-xl px-4 py-3 text-xs shadow-lg backdrop-blur flex justify-between gap-2 ${n.type === 'ok' ? 'bg-green-500/20 border-green-500/40 text-green-200' : n.type === 'err' ? 'bg-red-500/20 border-red-500/40 text-red-200' : 'bg-blue-500/20 border-blue-500/40 text-blue-200'}`}>
            <span>{n.msg}</span>
            <button onClick={() => dismiss(n.id)} className="opacity-60 hover:opacity-100">×</button>
          </div>
        ))}
      </div>

      <main className="max-w-[1180px] mx-auto px-4 py-6">{children}</main>

      <footer className="border-t border-border mt-8">
        <div className="max-w-[1180px] mx-auto px-4 py-4 flex justify-between items-center text-[10px] text-muted">
          <span>TechEval Pro v2.4.1</span>
          <span>Datos locales · Sin conexión a servidores externos</span>
        </div>
      </footer>
    </div>
  );
}

/* ============================
   APP
   ============================ */
function AppInner() {
  const { user } = useApp();
  const [page, setPage] = useState('dashboard');

  if (!user) return <Login />;

  const render = () => {
    switch (page) {
      case 'cases': return <Cases />;
      case 'audit': return <AuditView />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard onNav={setPage} />;
    }
  };

  return <Shell page={page} onNav={setPage}>{render()}</Shell>;
}

export default function App() {
  return (
    <Provider>
      <AppInner />
    </Provider>
  );
}
