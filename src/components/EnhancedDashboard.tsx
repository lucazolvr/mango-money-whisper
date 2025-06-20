import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  Calendar,
  PieChart,
  BarChart3,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useUserStatistics } from '@/hooks/useUserStatistics';
import { useCategoryAnalysis } from '@/hooks/useCategoryAnalysis';
import { useMonthlyReport } from '@/hooks/useMonthlyReport';

const EnhancedDashboard = () => {
  const { statistics, loading: statsLoading, error: statsError } = useUserStatistics();
  const { analysis, loading: analysisLoading } = useCategoryAnalysis(30);
  const { report, loading: reportLoading } = useMonthlyReport();

  if (statsLoading || analysisLoading || reportLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-mango-500" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Erro ao carregar estatísticas</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSavingsRate = () => {
    if (!report || report.receitas === 0) return 0;
    return ((report.receitas - report.despesas) / report.receitas) * 100;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com saudação e resumo principal */}
      <div className="bg-gradient-to-r from-mango-500 to-mango-600 rounded-3xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Dashboard Financeiro 📊</h2>
            <p className="text-mango-100">Visão completa das suas finanças</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-mango-100">Saldo atual</p>
            <p className={`text-3xl font-bold ${statistics?.saldo_atual >= 0 ? 'text-white' : 'text-red-200'}`}>
              {formatCurrency(statistics?.saldo_atual || 0)}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm">Transações</span>
            </div>
            <p className="text-xl font-semibold mt-1">{statistics?.total_transacoes || 0}</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span className="text-sm">Metas Ativas</span>
            </div>
            <p className="text-xl font-semibold mt-1">{statistics?.metas_ativas || 0}</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Agendamentos</span>
            </div>
            <p className="text-xl font-semibold mt-1">{statistics?.agendamentos_pendentes || 0}</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span className="text-sm">Taxa Poupança</span>
            </div>
            <p className="text-xl font-semibold mt-1">{getSavingsRate().toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Cards de métricas detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-green-200 bg-green-50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Receitas do Mês
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(report?.receitas || 0)}
            </div>
            <p className="text-xs text-green-600 mt-2">
              Total de receitas em {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">
              Gastos do Mês
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {formatCurrency(report?.despesas || 0)}
            </div>
            <p className="text-xs text-red-600 mt-2">
              Total de gastos em {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Metas Concluídas
            </CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {statistics?.metas_concluidas || 0}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Objetivos alcançados
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Categoria Principal
            </CardTitle>
            <Wallet className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-900 truncate">
              {statistics?.categoria_mais_usada || 'Nenhuma'}
            </div>
            <p className="text-xs text-purple-600 mt-2">
              Categoria mais utilizada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análise de gastos por categoria */}
      <Card className="border-mango-200">
        <CardHeader>
          <CardTitle className="text-mango-900 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Análise de Gastos por Categoria (Últimos 30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.length > 0 ? (
            <div className="space-y-4">
              {analysis.slice(0, 5).map((category, index) => (
                <div key={category.categoria_nome} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium text-gray-900">
                        {category.categoria_nome}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(category.total_gasto)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {category.quantidade_transacoes} transações
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={category.percentual} 
                      className="flex-1 h-2" 
                    />
                    <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
                      {category.percentual.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum gasto registrado nos últimos 30 dias</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo de performance */}
      <Card className="border-mango-200 bg-mango-50">
        <CardHeader>
          <CardTitle className="text-mango-900">📈 Resumo de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-mango-900 mb-1">
                {getSavingsRate() > 0 ? '+' : ''}{getSavingsRate().toFixed(1)}%
              </div>
              <p className="text-sm text-mango-600">Taxa de Poupança</p>
              <p className="text-xs text-gray-500 mt-1">
                {getSavingsRate() > 20 ? 'Excelente!' : getSavingsRate() > 10 ? 'Bom' : 'Pode melhorar'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-mango-900 mb-1">
                {statistics?.mes_mais_ativo || 'N/A'}
              </div>
              <p className="text-sm text-mango-600">Mês Mais Ativo</p>
              <p className="text-xs text-gray-500 mt-1">
                Período com mais transações
              </p>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${getBalanceColor(statistics?.saldo_atual || 0)}`}>
                {statistics?.saldo_atual >= 0 ? '📈' : '📉'}
              </div>
              <p className="text-sm text-mango-600">Tendência</p>
              <p className="text-xs text-gray-500 mt-1">
                {statistics?.saldo_atual >= 0 ? 'Saldo positivo' : 'Atenção ao saldo'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboard;