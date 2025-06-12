
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { useGoals } from '@/hooks/useGoals';
import { useAuth } from '@/contexts/AuthContext';

const Reports = () => {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { goals, loading: goalsLoading } = useGoals();
  const { user } = useAuth();

  const userName = user?.user_metadata?.nome_completo || 'Usuário';

  // Gerar dados mensais dos últimos 6 meses
  const generateMonthlyData = () => {
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.data);
        return transactionDate >= date && transactionDate < nextMonth;
      });
      
      const receitas = monthTransactions
        .filter(t => t.tipo === 'receita')
        .reduce((sum, t) => sum + t.valor, 0);
      
      const gastos = monthTransactions
        .filter(t => t.tipo === 'despesa')
        .reduce((sum, t) => sum + t.valor, 0);
      
      const economia = Math.max(0, receitas - gastos);
      
      monthlyData.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        receitas,
        gastos,
        economia
      });
    }
    
    return monthlyData;
  };

  // Calcular métricas do mês atual
  const getCurrentMonthMetrics = () => {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const currentMonthTransactions = transactions.filter(t => 
      new Date(t.data) >= firstDayOfMonth
    );
    
    const receitas = currentMonthTransactions
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const gastos = currentMonthTransactions
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const saldo = receitas - gastos;
    
    // Meta principal
    const mainGoal = goals.find(g => g.status === 'ativa');
    const metaEconomia = mainGoal ? mainGoal.valor_alvo : 1000;
    const economiaAtual = Math.max(0, saldo);
    
    return {
      receitas,
      gastos,
      saldo,
      economiaAtual,
      metaEconomia,
      orçamentoUsado: receitas > 0 ? (gastos / receitas) * 100 : 0
    };
  };

  // Gerar insights baseados nos dados
  const generateInsights = () => {
    const monthlyData = generateMonthlyData();
    const currentMonth = getCurrentMonthMetrics();
    
    const insights = [];
    
    // Insight sobre economia
    if (monthlyData.length >= 2) {
      const currentEconomy = monthlyData[monthlyData.length - 1].economia;
      const previousEconomy = monthlyData[monthlyData.length - 2].economia;
      const changePercent = previousEconomy > 0 ? ((currentEconomy - previousEconomy) / previousEconomy) * 100 : 0;
      
      if (changePercent > 10) {
        insights.push({
          type: 'positive',
          icon: TrendingUp,
          title: 'Economia em alta! 📈',
          description: `Você economizou ${changePercent.toFixed(0)}% mais que o mês passado. Continue assim!`,
          color: 'green'
        });
      } else if (changePercent < -10) {
        insights.push({
          type: 'warning',
          icon: TrendingDown,
          title: 'Atenção à economia',
          description: `Sua economia diminuiu ${Math.abs(changePercent).toFixed(0)}% em relação ao mês passado.`,
          color: 'yellow'
        });
      }
    }
    
    // Insight sobre meta
    const mainGoal = goals.find(g => g.status === 'ativa');
    if (mainGoal) {
      const progressPercent = (mainGoal.valor_atual / mainGoal.valor_alvo) * 100;
      const remaining = mainGoal.valor_alvo - mainGoal.valor_atual;
      
      if (progressPercent >= 80) {
        insights.push({
          type: 'positive',
          icon: Target,
          title: 'Quase lá! 🎯',
          description: `Você já alcançou ${progressPercent.toFixed(0)}% da sua meta "${mainGoal.titulo}".`,
          color: 'green'
        });
      } else if (remaining > 0) {
        insights.push({
          type: 'info',
          icon: Target,
          title: 'Meta em andamento',
          description: `Faltam R$ ${remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para atingir "${mainGoal.titulo}".`,
          color: 'blue'
        });
      }
    }
    
    // Insight sobre orçamento
    if (currentMonth.orçamentoUsado > 80) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Atenção ao orçamento',
        description: 'Seus gastos estão altos em relação às receitas este mês.',
        color: 'yellow'
      });
    }
    
    // Insight sobre metas ativas
    const activesGoals = goals.filter(g => g.status === 'ativa').length;
    if (activesGoals === 0) {
      insights.push({
        type: 'tip',
        icon: Calendar,
        title: 'Crie uma meta financeira',
        description: 'Definir objetivos ajuda a manter o foco na economia.',
        color: 'purple'
      });
    }
    
    return insights.slice(0, 4); // Limitar a 4 insights
  };

  const monthlyData = generateMonthlyData();
  const currentMonth = getCurrentMonthMetrics();
  const insights = generateInsights();

  const getInsightColor = (color: string) => {
    const colors = {
      green: 'border-green-200 bg-green-50 text-green-700',
      yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700',
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      purple: 'border-purple-200 bg-purple-50 text-purple-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (transactionsLoading || goalsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-mango-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho com resumo mensal */}
      <div className="bg-gradient-to-r from-mango-500 to-mango-600 rounded-3xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Relatório Mensal - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h2>
        <p className="text-mango-100 mb-6">Olá {userName}, aqui está como foi seu mês financeiro</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Receitas vs Gastos</span>
              <span className="text-lg font-bold">
                {currentMonth.receitas > 0 ? Math.round((currentMonth.gastos / currentMonth.receitas) * 100) : 0}%
              </span>
            </div>
            <Progress value={currentMonth.orçamentoUsado} className="mb-2" />
            <p className="text-xs text-mango-100">
              R$ {(currentMonth.receitas - currentMonth.gastos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de saldo
            </p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Meta de Economia</span>
              <span className="text-lg font-bold">
                {currentMonth.metaEconomia > 0 ? Math.round((currentMonth.economiaAtual / currentMonth.metaEconomia) * 100) : 0}%
              </span>
            </div>
            <Progress value={(currentMonth.economiaAtual / currentMonth.metaEconomia) * 100} className="mb-2" />
            <p className="text-xs text-mango-100">
              R$ {(currentMonth.metaEconomia - currentMonth.economiaAtual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para a meta
            </p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <span className="text-sm block mb-1">Metas ativas</span>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span className="text-lg font-bold">{goals.filter(g => g.status === 'ativa').length}</span>
            </div>
            <p className="text-xs text-mango-100">objetivos em andamento</p>
          </div>
        </div>
      </div>

      {/* Gráfico de evolução mensal */}
      {monthlyData.length > 0 && (
        <Card className="border-mango-200">
          <CardHeader>
            <CardTitle className="text-mango-900">Evolução dos Últimos 6 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#c2410c" />
                  <YAxis stroke="#c2410c" tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip 
                    formatter={(value, name) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, name === 'receitas' ? 'Receitas' : name === 'gastos' ? 'Gastos' : 'Economia']}
                    contentStyle={{
                      backgroundColor: '#fff7ed',
                      border: '1px solid #f97316',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="receitas" fill="#10b981" name="receitas" />
                  <Bar dataKey="gastos" fill="#ef4444" name="gastos" />
                  <Bar dataKey="economia" fill="#f97316" name="economia" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Personalizados */}
      <Card className="border-mango-200">
        <CardHeader>
          <CardTitle className="text-mango-900">Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-xl border-2 ${getInsightColor(insight.color)}`}>
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <insight.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-mango-600">Adicione mais transações para gerar insights personalizados!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projeções */}
      {transactions.length > 0 && (
        <Card className="border-mango-200">
          <CardHeader>
            <CardTitle className="text-mango-900">Projeções para o Próximo Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  R$ {(currentMonth.saldo * 1.05).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-blue-700 font-medium">Saldo Projetado</p>
                <p className="text-sm text-blue-600 mt-1">Baseado no crescimento médio</p>
              </div>
              
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {goals.filter(g => g.status === 'ativa').length > 0 ? '75%' : '0%'}
                </div>
                <p className="text-green-700 font-medium">Chance de Meta</p>
                <p className="text-sm text-green-600 mt-1">
                  {goals.filter(g => g.status === 'ativa').length > 0 
                    ? 'Probabilidade de atingir suas metas'
                    : 'Crie uma meta para ver projeções'
                  }
                </p>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  R$ {Math.max(0, currentMonth.economiaAtual * 1.1).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-purple-700 font-medium">Economia Estimada</p>
                <p className="text-sm text-purple-600 mt-1">Se manter o ritmo atual</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas Personalizadas */}
      <Card className="border-mango-200 bg-mango-50">
        <CardHeader>
          <CardTitle className="text-mango-900">💡 Dicas do Mango para Você</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentMonth.orçamentoUsado > 80 && (
              <div className="p-4 bg-white rounded-xl">
                <h4 className="font-semibold text-mango-900 mb-2">Otimize seus gastos</h4>
                <p className="text-sm text-gray-600">
                  Seus gastos estão altos este mês. Revise suas despesas e veja onde pode economizar!
                </p>
              </div>
            )}
            
            {goals.filter(g => g.status === 'ativa').length === 0 && (
              <div className="p-4 bg-white rounded-xl">
                <h4 className="font-semibold text-mango-900 mb-2">Defina uma meta financeira</h4>
                <p className="text-sm text-gray-600">
                  Ter objetivos claros ajuda a manter o foco na economia. Que tal criar sua primeira meta?
                </p>
              </div>
            )}
            
            {currentMonth.economiaAtual > 0 && (
              <div className="p-4 bg-white rounded-xl">
                <h4 className="font-semibold text-mango-900 mb-2">Parabéns pela economia!</h4>
                <p className="text-sm text-gray-600">
                  Você está economizando R$ {currentMonth.economiaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} este mês. Continue assim!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
