
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import ChatBot from '@/components/ChatBot';
import TransactionHistory from '@/components/TransactionHistory';
import Reports from '@/components/Reports';

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
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-mango-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-mango-500 to-mango-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🥭</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-mango-900">Mango</h1>
                <p className="text-sm text-mango-600">Seu assistente financeiro de bolso</p>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-sm text-mango-600">Seu dinheiro mais claro, com um simples "Oi"</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="container mx-auto px-4 py-4">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
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
          <p className="text-sm text-mango-300">Desenvolvido com ❤️ para tornar suas finanças mais simples</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
