
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Wallet, CreditCard, AlertCircle } from 'lucide-react';
import { BalanceChart } from './BalanceChart';
import { CategoryChart } from './CategoryChart';
import { RecentTransactions } from './RecentTransactions';

const Dashboard = () => {
  const balance = 2500.50;
  const income = 3200.00;
  const expenses = 1800.50;
  const savings = balance - expenses;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Saudação e Resumo Principal */}
      <div className="bg-gradient-to-r from-mango-500 to-mango-600 rounded-3xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Olá, Carla! 👋</h2>
            <p className="text-mango-100">Aqui está sua situação financeira de hoje</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-mango-100">Saldo atual</p>
            <p className="text-3xl font-bold">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">Receitas</span>
            </div>
            <p className="text-xl font-semibold mt-1">R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5" />
              <span className="text-sm">Gastos</span>
            </div>
            <p className="text-xl font-semibold mt-1">R$ {expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Cards de Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-mango-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-mango-700">Meta de Economia</CardTitle>
            <Wallet className="h-4 w-4 text-mango-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mango-900">68%</div>
            <Progress value={68} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Faltam R$ 320 para sua meta mensal
            </p>
          </CardContent>
        </Card>

        <Card className="border-mango-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-mango-700">Gastos vs Orçamento</CardTitle>
            <CreditCard className="h-4 w-4 text-mango-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-22%</div>
            <Progress value={78} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Você está gastando menos que o planejado!
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Próximos Vencimentos</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">3</div>
            <p className="text-xs text-yellow-600 mt-2">
              Cartão de crédito vence em 5 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-mango-200">
          <CardHeader>
            <CardTitle className="text-mango-900">Evolução do Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <BalanceChart />
          </CardContent>
        </Card>

        <Card className="border-mango-200">
          <CardHeader>
            <CardTitle className="text-mango-900">Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart />
          </CardContent>
        </Card>
      </div>

      {/* Transações Recentes */}
      <Card className="border-mango-200">
        <CardHeader>
          <CardTitle className="text-mango-900">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentTransactions />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
