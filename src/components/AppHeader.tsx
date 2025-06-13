
import React from 'react';
import { Menu, Settings, User, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

interface AppHeaderProps {
  onProfileClick: () => void;
}

const AppHeader = ({ onProfileClick }: AppHeaderProps) => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Desconectado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desconectar. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSettings = (setting: string) => {
    // Implementar navegação ou abrir modais específicos para cada configuração
    switch (setting) {
      case 'notifications':
        toast({
          title: "Notificações",
          description: "Configurações de notificações em desenvolvimento.",
        });
        break;
      case 'privacy':
        toast({
          title: "Privacidade",
          description: "Configurações de privacidade em desenvolvimento.",
        });
        break;
      case 'security':
        toast({
          title: "Segurança",
          description: "Configurações de segurança em desenvolvimento.",
        });
        break;
      case 'help':
        // Abrir uma página de ajuda ou modal
        toast({
          title: "Ajuda",
          description: "Central de ajuda em desenvolvimento.",
        });
        break;
      case 'about':
        toast({
          title: "Sobre o Mango",
          description: "Mango - Seu assistente financeiro inteligente. Versão 1.0",
        });
        break;
      default:
        console.log('Setting clicked:', setting);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getUserName = () => {
    return profile?.nome_completo || 'Usuário';
  };

  const getUserEmail = () => {
    return profile?.email || user?.email || 'email@exemplo.com';
  };

  return (
    <header className="bg-white border-b border-mango-200 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Menu toggle */}
        <div className="flex items-center space-x-3">
          <SidebarTrigger className="lg:hidden">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-mango-500 to-mango-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🥭</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-mango-900">Mango</h1>
            </div>
          </div>
        </div>

        {/* Center - Tagline (hidden on mobile) */}
        <div className="hidden md:block">
          <p className="text-sm text-mango-600 font-medium">Seu dinheiro mais claro, com um simples "Oi"</p>
        </div>

        {/* Right side - Settings and Avatar */}
        <div className="flex items-center space-x-3">
          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 text-mango-600 hover:text-mango-700 hover:bg-mango-50"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border border-mango-200">
              <DropdownMenuItem 
                onClick={() => handleSettings('notifications')}
                className="cursor-pointer hover:bg-mango-50"
              >
                <span>Notificações</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleSettings('privacy')}
                className="cursor-pointer hover:bg-mango-50"
              >
                <span>Privacidade</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleSettings('security')}
                className="cursor-pointer hover:bg-mango-50"
              >
                <span>Segurança</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-mango-200" />
              <DropdownMenuItem 
                onClick={() => handleSettings('help')}
                className="cursor-pointer hover:bg-mango-50"
              >
                <span>Ajuda</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleSettings('about')}
                className="cursor-pointer hover:bg-mango-50"
              >
                <span>Sobre o Mango</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={getUserName()} />
                  <AvatarFallback className="bg-mango-100 text-mango-700 font-semibold">
                    {getInitials(getUserName())}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border border-mango-200">
              <div className="px-3 py-2 border-b border-mango-200">
                <p className="text-sm font-medium text-mango-900">{getUserName()}</p>
                <p className="text-xs text-mango-600">{getUserEmail()}</p>
              </div>
              <DropdownMenuItem 
                onClick={onProfileClick}
                className="cursor-pointer hover:bg-mango-50"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Ver perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-mango-200" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer hover:bg-mango-50 text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export { AppHeader };
