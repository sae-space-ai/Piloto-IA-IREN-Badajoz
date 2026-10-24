export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Opportunity {
  id: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  description: string;
  status: 'new' | 'qualified' | 'in_progress' | 'completed' | 'rejected';
  criteria: {
    need: boolean;
    decisionMaker: boolean;
    dataAvailable: boolean;
    technicalFeasibility: boolean;
    budget: boolean;
    irenFit: boolean;
    nextStep: boolean;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  description: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
}
