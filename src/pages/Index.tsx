
import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import Dashboard from '@/components/Dashboard';
import ChatBot from '@/components/ChatBot';
import TransactionHistory from '@/components/TransactionHistory';
import Agendamentos from '@/components/Agendamentos';
import Goals from '@/components/Goals';
import Reports from '@/components/Reports';
import Profile from '@/components/Profile';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'chat':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-mango-900 mb-2">Chat com Mango 🥭</h1>
              <p className="text-mango-600">Converse comigo para registrar suas transações ou tirar dúvidas</p>
            </div>
            <ChatBot />
          </div>
        );
      case 'transactions':
        return <TransactionHistory />;
      case 'agendamentos':
        return (
          <div className="max-w-7xl mx-auto">
            <Agendamentos />
          </div>
        );
      case 'goals':
        return <Goals />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-50 to-white">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col">
          <AppHeader onProfileClick={() => setActiveTab('profile')} />

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 py-8">
            {renderContent()}
          </main>

          {/* Footer */}
          <footer className="bg-mango-900 text-white py-8 mt-12">
            <div className="container mx-auto px-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-2xl">🥭</span>
                <span className="text-xl font-bold">Mango</span>
              </div>
              <p className="text-mango-200 mb-2">Seu assistente financeiro de bolso</p>
              <p className="text-sm text-mango-300"> Mango onde suas finanças dão frutos 🥭</p>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
