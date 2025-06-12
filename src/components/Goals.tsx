
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Target, Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGoals, Goal } from '@/hooks/useGoals';
import { useTransactions } from '@/hooks/useTransactions';
import GoalForm from '@/components/GoalForm';
import { useToast } from '@/hooks/use-toast';

const Goals = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { goals, loading, deleteGoal } = useGoals();
  const { transactions } = useTransactions();
  const { toast } = useToast();

  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    if (filter === 'active') return goal.status === 'ativa';
    if (filter === 'completed') return goal.status === 'concluida';
    return true;
  });

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateEstimatedTime = (current: number, target: number) => {
    const remaining = target - current;
    
    // Calcular economia média dos últimos 3 meses
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentTransactions = transactions.filter(t => 
      new Date(t.data) >= threeMonthsAgo
    );
    
    const income = recentTransactions
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const expenses = recentTransactions
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const monthlySavings = (income - expenses) / 3;
    
    if (remaining <= 0) return 'Meta alcançada!';
    if (monthlySavings <= 0) return 'Revise seu orçamento';
    
    const monthsRemaining = Math.ceil(remaining / monthlySavings);
    
    if (monthsRemaining === 1) return '1 mês';
    return `${monthsRemaining} meses`;
  };

  const handleGoalAction = async (goalId: string, action: string) => {
    if (action === 'edit') {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        setEditingGoal(goal);
        setIsFormOpen(true);
      }
    } else if (action === 'delete') {
      try {
        await deleteGoal(goalId);
      } catch (error) {
        console.error('Erro ao excluir meta:', error);
      }
    } else if (action === 'complete') {
      // Implementar marcar como concluída
      console.log('Marcar como concluída:', goalId);
    }
  };

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingGoal(null);
  };

  // Gerar dados do gráfico baseado nas transações
  const generateChartData = () => {
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.data);
        return transactionDate >= date && transactionDate < nextMonth;
      });
      
      const income = monthTransactions
        .filter(t => t.tipo === 'receita')
        .reduce((sum, t) => sum + t.valor, 0);
      
      const expenses = monthTransactions
        .filter(t => t.tipo === 'despesa')
        .reduce((sum, t) => sum + t.valor, 0);
      
      const savings = income - expenses;
      
      monthlyData.push({
        mes: date.toLocaleDateString('pt-BR', { month: 'short' }),
        economia: Math.max(0, savings)
      });
    }
    
    return monthlyData;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-mango-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-mango-900 mb-2">Minhas Metas</h1>
          <p className="text-mango-600">Acompanhe seu progresso e alcance seus objetivos financeiros</p>
        </div>
        <Button 
          onClick={handleCreateGoal}
          className="bg-mango-500 hover:bg-mango-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar nova meta
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-mango-500 hover:bg-mango-600' : 'border-mango-200 text-mango-700 hover:bg-mango-50'}
        >
          Todas ({goals.length})
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'bg-mango-500 hover:bg-mango-600' : 'border-mango-200 text-mango-700 hover:bg-mango-50'}
        >
          Ativas ({goals.filter(g => g.status === 'ativa').length})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
          className={filter === 'completed' ? 'bg-mango-500 hover:bg-mango-600' : 'border-mango-200 text-mango-700 hover:bg-mango-50'}
        >
          Concluídas ({goals.filter(g => g.status === 'concluida').length})
        </Button>
      </div>

      {/* Lista de Metas */}
      <div className="grid gap-4">
        {filteredGoals.length === 0 ? (
          <Card className="border-mango-200">
            <CardContent className="p-12 text-center">
              <Target className="w-12 h-12 text-mango-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-mango-900 mb-2">
                {filter === 'all' ? 'Nenhuma meta criada' : `Nenhuma meta ${filter === 'active' ? 'ativa' : 'concluída'}`}
              </h3>
              <p className="text-mango-600 mb-4">
                {filter === 'all' 
                  ? 'Crie sua primeira meta financeira para começar a acompanhar seus objetivos!'
                  : `Você não tem metas ${filter === 'active' ? 'ativas' : 'concluídas'} no momento.`
                }
              </p>
              {filter === 'all' && (
                <Button 
                  onClick={handleCreateGoal}
                  className="bg-mango-500 hover:bg-mango-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira meta
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredGoals.map((goal) => (
            <Card key={goal.id} className="border-mango-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-mango-100 rounded-full">
                      <Target className="w-5 h-5 text-mango-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-mango-900">{goal.titulo}</h3>
                      {goal.descricao && (
                        <p className="text-sm text-mango-600 mt-1">{goal.descricao}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-mango-600 mt-1">
                        <span>Meta: {formatCurrency(goal.valor_alvo)}</span>
                        <span>•</span>
                        <span>Atual: {formatCurrency(goal.valor_atual)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {goal.status === 'concluida' && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Concluída
                      </Badge>
                    )}
                    {goal.status === 'pausada' && (
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        Pausada
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border border-mango-200">
                        <DropdownMenuItem onClick={() => handleGoalAction(goal.id, 'edit')}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleGoalAction(goal.id, 'delete')} className="text-red-600">
                          Excluir
                        </DropdownMenuItem>
                        {goal.status === 'ativa' && (
                          <DropdownMenuItem onClick={() => handleGoalAction(goal.id, 'complete')}>
                            Marcar como concluída
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-mango-600">Progresso</span>
                    <span className="font-medium text-mango-900">
                      {calculateProgress(goal.valor_atual, goal.valor_alvo).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={calculateProgress(goal.valor_atual, goal.valor_alvo)} 
                    className="h-3 bg-mango-100" 
                  />
                </div>

                {/* Informações adicionais */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-mango-600">
                    <Calendar className="w-4 h-4" />
                    <span>Previsão: {calculateEstimatedTime(goal.valor_atual, goal.valor_alvo)}</span>
                  </div>
                  <div className="text-mango-600">
                    Faltam: {formatCurrency(Math.max(0, goal.valor_alvo - goal.valor_atual))}
                  </div>
                </div>

                {goal.data_limite && (
                  <div className="mt-2 text-xs text-mango-500">
                    Data limite: {new Date(goal.data_limite).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Gráfico de Evolução */}
      {transactions.length > 0 && (
        <Card className="border-mango-200">
          <CardHeader>
            <CardTitle className="text-mango-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-mango-600" />
              Evolução da Economia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                  <XAxis dataKey="mes" stroke="#c2410c" />
                  <YAxis stroke="#c2410c" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #fed7aa',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [formatCurrency(Number(value)), 'Economia']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="economia" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de formulário */}
      <GoalForm 
        open={isFormOpen}
        onOpenChange={handleFormClose}
        goal={editingGoal}
        onSuccess={handleFormClose}
      />
    </div>
  );
};

export default Goals;
