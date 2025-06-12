
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Settings } from 'lucide-react';
import OpenFinanceConnect from './OpenFinanceConnect';

const Profile = () => {
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
                  <AvatarImage src="/placeholder.svg" alt="Foto do perfil" />
                  <AvatarFallback className="bg-mango-100 text-mango-700 text-lg font-semibold">
                    CM
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="text-sm font-medium text-mango-700">Nome Completo</label>
                    <p className="text-mango-900 font-medium">Carla Martins</p>
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
                  <p className="text-mango-900">carla.martins@email.com</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-mango-700 flex items-center">
                    <Phone className="mr-1 h-4 w-4" />
                    Telefone
                  </label>
                  <p className="text-mango-900">(11) 99999-9999</p>
                </div>
              </div>

              <Button className="w-full sm:w-auto bg-mango-500 hover:bg-mango-600 text-white">
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
                <span className="text-sm text-mango-900">Janeiro 2024</span>
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Open Finance Integration */}
      <OpenFinanceConnect />
    </div>
  );
};

export default Profile;
