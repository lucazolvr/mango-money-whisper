
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Settings, CreditCard } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import ProfileEditForm from './ProfileEditForm';
import OpenFinanceConnect from './OpenFinanceConnect';

const Profile = () => {
  const { profile, loading } = useProfile();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isOpenFinanceDialogOpen, setIsOpenFinanceDialogOpen] = useState(false);

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-mango-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-mango-900 mb-2">Meu Perfil</h1>
        <p className="text-mango-600">Gerencie suas informações pessoais e configurações</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Pessoais */}
        <div className="lg:col-span-2">
          <Card className="border-mango-200">
            <CardHeader>
              <CardTitle className="text-mango-900 flex items-center">
                <User className="mr-2 h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Mantenha seus dados atualizados para uma melhor experiência
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt="Foto do perfil" />
                  <AvatarFallback className="bg-mango-100 text-mango-700 text-lg font-semibold">
                    {getInitials(profile?.nome_completo)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="text-sm font-medium text-mango-700">Nome Completo</label>
                    <p className="text-mango-900 font-medium">{profile?.nome_completo || 'Não informado'}</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-mango-300 text-mango-700 hover:bg-mango-50">
                    Alterar Foto
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-mango-700 flex items-center">
                    <Mail className="mr-1 h-4 w-4" />
                    Email
                  </label>
                  <p className="text-mango-900">{profile?.email || user?.email || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-mango-700 flex items-center">
                    <Phone className="mr-1 h-4 w-4" />
                    Telefone
                  </label>
                  <p className="text-mango-900">{profile?.telefone || 'Não informado'}</p>
                </div>
              </div>

              <Button 
                onClick={() => setIsEditDialogOpen(true)}
                className="w-full sm:w-auto bg-mango-500 hover:bg-mango-600 text-white"
              >
                Editar Informações
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Status da Conta */}
        <div className="space-y-6">
          <Card className="border-mango-200">
            <CardHeader>
              <CardTitle className="text-mango-900 flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Status da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-mango-600">Conta Verificada</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-mango-600">Plano Atual</span>
                <Badge className="bg-mango-100 text-mango-800">Gratuito</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-mango-600">Membro desde</span>
                <span className="text-sm text-mango-900">
                  {profile?.created_at ? formatDate(profile.created_at) : 'Não informado'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-mango-200">
            <CardHeader>
              <CardTitle className="text-mango-900 flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full border-mango-300 text-mango-700 hover:bg-mango-50">
                Alterar Senha
              </Button>
              <Button variant="outline" className="w-full border-mango-300 text-mango-700 hover:bg-mango-50">
                Notificações
              </Button>
              <Button variant="outline" className="w-full border-mango-300 text-mango-700 hover:bg-mango-50">
                Privacidade
              </Button>
              <Button 
                onClick={() => setIsOpenFinanceDialogOpen(true)}
                variant="outline" 
                className="w-full border-mango-300 text-mango-700 hover:bg-mango-50 flex items-center justify-center"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Conectar Banco
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <ProfileEditForm 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      {isOpenFinanceDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-mango-900">Conectar Banco</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpenFinanceDialogOpen(false)}
                  className="border-mango-300 text-mango-700 hover:bg-mango-50"
                >
                  Fechar
                </Button>
              </div>
              <OpenFinanceConnect />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
