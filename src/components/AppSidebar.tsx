
import React from 'react';
import { User, BarChart3, MessageCircle, Clock, FileText } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AppSidebar = ({ activeTab, onTabChange }: AppSidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'transactions', label: 'Histórico', icon: Clock },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <Sidebar className="border-r border-mango-200 bg-white">
      <SidebarHeader className="p-4 border-b border-mango-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-mango-500 to-mango-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">🥭</span>
          </div>
          <div>
            <h2 className="font-bold text-mango-900">Mango</h2>
            <p className="text-xs text-mango-600">Menu</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-mango-700 font-medium">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    className={`w-full justify-start ${
                      activeTab === item.id
                        ? 'bg-mango-100 text-mango-700 border-r-2 border-mango-500'
                        : 'text-mango-600 hover:bg-mango-50'
                    }`}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export { AppSidebar };
