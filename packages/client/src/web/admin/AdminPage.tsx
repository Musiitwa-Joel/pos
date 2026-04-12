import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import ContentManager from './ContentManager';
import Inquiries from './Inquiries';
import Settings from './Settings';

export default function AdminPage() {
  const [activeView, setActiveView] = useState('dashboard');

  const handleLogout = () => {
    // In a real app, this would clear the session
    window.location.href = '/';
  };

  return (
    <AdminLayout 
      activeView={activeView} 
      onViewChange={setActiveView}
      onLogout={handleLogout}
    >
      {activeView === 'dashboard' && <Dashboard />}
      {activeView === 'content' && <ContentManager />}
      {activeView === 'inquiries' && <Inquiries />}
      {activeView === 'settings' && <Settings />}
    </AdminLayout>
  );
}
