import type { User, Opportunity, AuditLog, BudgetItem } from '../types';

const KEYS = {
  USERS: 'mm_ah_users',
  CURRENT_USER: 'mm_ah_current_user',
  OPPORTUNITIES: 'mm_ah_opportunities',
  AUDIT_LOG: 'mm_ah_audit_log',
  BUDGET: 'mm_ah_budget',
  GDPR_CONSENT: 'mm_ah_gdpr_consent',
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- Users ----
const DEFAULT_USERS: User[] = [
  {
    id: 'usr_001',
    email: 'admin@montemolin.ai',
    name: 'Administrador',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_002',
    email: 'analista@montemolin.ai',
    name: 'Analista',
    role: 'user',
    createdAt: new Date().toISOString(),
  },
];

export function getUsers(): User[] {
  return getItem<User[]>(KEYS.USERS, DEFAULT_USERS);
}

export function authenticate(email: string, password: string): User | null {
  // Demo: password is "demo1234" for all users
  if (password !== 'demo1234') return null;
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function getCurrentUser(): User | null {
  return getItem<User | null>(KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: User | null): void {
  setItem(KEYS.CURRENT_USER, user);
}

// ---- GDPR Consent ----
export function hasGdprConsent(): boolean {
  return getItem<boolean>(KEYS.GDPR_CONSENT, false);
}

export function setGdprConsent(value: boolean): void {
  setItem(KEYS.GDPR_CONSENT, value);
}

// ---- Audit Log ----
export function getAuditLogs(): AuditLog[] {
  return getItem<AuditLog[]>(KEYS.AUDIT_LOG, []);
}

export function addAuditLog(
  userId: string,
  userName: string,
  action: string,
  resource: string,
  resourceId: string,
  details: string
): void {
  const logs = getAuditLogs();
  logs.unshift({
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    action,
    resource,
    resourceId,
    details,
  });
  // Keep last 500 entries
  if (logs.length > 500) logs.length = 500;
  setItem(KEYS.AUDIT_LOG, logs);
}

// ---- Opportunities ----
const DEFAULT_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_001',
    companyName: 'Empresa Demo A (simulada)',
    contactPerson: 'Juan García',
    contactEmail: 'jgarcia@demo-a.es',
    description: 'Automatización de clasificación documental con IA.',
    status: 'new',
    criteria: {
      need: true,
      decisionMaker: true,
      dataAvailable: false,
      technicalFeasibility: true,
      budget: false,
      irenFit: false,
      nextStep: false,
    },
    notes: 'Caso ficticio para demostración del sistema.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'usr_001',
  },
  {
    id: 'opp_002',
    companyName: 'Empresa Demo B (simulada)',
    contactPerson: 'María López',
    contactEmail: 'mlopez@demo-b.es',
    description: 'Visión artificial para control de calidad en línea de producción.',
    status: 'in_progress',
    criteria: {
      need: true,
      decisionMaker: true,
      dataAvailable: true,
      technicalFeasibility: true,
      budget: true,
      irenFit: true,
      nextStep: true,
    },
    notes: 'Caso ficticio cualificado completamente para demostración.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'usr_001',
  },
];

export function getOpportunities(): Opportunity[] {
  return getItem<Opportunity[]>(KEYS.OPPORTUNITIES, DEFAULT_OPPORTUNITIES);
}

export function getOpportunity(id: string): Opportunity | undefined {
  return getOpportunities().find((o) => o.id === id);
}

export function saveOpportunity(opp: Opportunity): void {
  const opps = getOpportunities();
  const idx = opps.findIndex((o) => o.id === opp.id);
  opp.updatedAt = new Date().toISOString();
  if (idx >= 0) {
    opps[idx] = opp;
  } else {
    opps.push(opp);
  }
  setItem(KEYS.OPPORTUNITIES, opps);
}

export function deleteOpportunity(id: string): void {
  const opps = getOpportunities().filter((o) => o.id !== id);
  setItem(KEYS.OPPORTUNITIES, opps);
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---- Budget ----
const DEFAULT_BUDGET: BudgetItem[] = [
  { id: 'b1', category: 'Dirección', amount: 8250, description: 'Gestión de proyecto' },
  { id: 'b2', category: 'Descubrimiento', amount: 5400, description: 'Análisis de necesidades' },
  { id: 'b3', category: 'Arquitectura y seguridad', amount: 7800, description: 'Diseño técnico y seguridad' },
  { id: 'b4', category: 'Ingeniería', amount: 15000, description: 'Desarrollo de prototipos' },
  { id: 'b5', category: 'QA', amount: 4500, description: 'Pruebas y validación' },
  { id: 'b6', category: 'Infraestructura', amount: 3000, description: 'Cloud y servicios' },
  { id: 'b7', category: 'Viajes', amount: 1500, description: 'Desplazamientos' },
  { id: 'b8', category: 'Contingencia', amount: 4050, description: 'Reserva para imprevistos' },
];

export function getBudget(): BudgetItem[] {
  return getItem<BudgetItem[]>(KEYS.BUDGET, DEFAULT_BUDGET);
}

export function saveBudget(items: BudgetItem[]): void {
  setItem(KEYS.BUDGET, items);
}

// ---- Export ----
export function exportAllData(): string {
  const data = {
    exportedAt: new Date().toISOString(),
    opportunities: getOpportunities(),
    budget: getBudget(),
    auditLogs: getAuditLogs().slice(0, 100),
  };
  return JSON.stringify(data, null, 2);
}

export function purgeAllData(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
