
import React from 'react';
import { Card } from '@/components/ui/card';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'transactions', label: 'Histórico', icon: '📋' },
    { id: 'reports', label: 'Relatórios', icon: '📈' },
  ];

  return (
    <Card className="p-1 border-mango-200">
      <nav className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-mango-500 text-white shadow-md'
                : 'text-mango-700 hover:bg-mango-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </Card>
  );
};

export default Navigation;
