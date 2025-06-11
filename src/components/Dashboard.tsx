
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Wallet, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { BalanceChart } from './BalanceChart';
import { CategoryChart } from './CategoryChart';
import { RecentTransactions } from './RecentTransactions';
import { useTransactions } from '@/hooks/useTransactions';
import { useGoals } from '@/hooks/useGoals';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { goals, loading: goalsLoading } = useGoals();
  const { user } = useAuth();

  // Calcular métricas financeiras
  const income = transactions
    .filter(t => t.tipo === 'receita')
    .reduce((sum, t) => sum + t.valor, 0);
  
  const expenses = transactions
    .filter(t => t.tipo === 'despesa')
    .reduce((sum, t) => sum + t.valor, 0);
  
  const balance = income - expenses;

  // Meta principal (primeira meta ativa)
  const mainGoal = goals.find(g => g.status === 'ativa');
  const goalProgress = mainGoal ? (mainGoal.valor_atual / mainGoal.valor_alvo) * 100 : 0;

  const userName = user?.user_metadata?.nome_completo || 'Usuário';

  if (transactionsLoading || goalsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-mango-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Saudação e Resumo Principal */}
      <div className="bg-gradient-to-r from-mango-500 to-mango-600 rounded-3xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Olá, {userName}! 👋</h2>
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
            <CardTitle className="text-sm font-medium text-mango-700">
              {mainGoal ? mainGoal.titulo : 'Meta de Economia'}
            </CardTitle>
            <Wallet className="h-4 w-4 text-mango-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mango-900">
              {Math.round(goalProgress)}%
            </div>
            <Progress value={goalProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {mainGoal 
                ? `R$ ${(mainGoal.valor_alvo - mainGoal.valor_atual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} restantes`
                : 'Crie sua primeira meta!'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="border-mango-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-mango-700">Economia Este Mês</CardTitle>
            <CreditCard className="h-4 w-4 text-mango-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {balance >= 0 ? 'Você está economizando!' : 'Gastos maiores que receitas'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Metas Ativas</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {goals.filter(g => g.status === 'ativa').length}
            </div>
            <p className="text-xs text-yellow-600 mt-2">
              {goals.filter(g => g.status === 'ativa').length === 0 
                ? 'Crie sua primeira meta!' 
                : 'metas em andamento'
              }
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
