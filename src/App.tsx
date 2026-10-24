import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Opportunities from './components/Opportunities';
import FinancialSimulator from './components/FinancialSimulator';
import AuditLogView from './components/AuditLog';
import Settings from './components/Settings';

function AppContent() {
  const { user } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'opportunities':
        return <Opportunities />;
      case 'simulator':
        return <FinancialSimulator />;
      case 'audit':
        return <AuditLogView />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
