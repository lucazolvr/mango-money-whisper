
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Target, Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data para demonstração
const mockGoals = [
  {
    id: 1,
    name: 'Juntar para viagem',
    targetAmount: 5000,
    currentAmount: 3200,
    status: 'active',
    createdAt: '2024-01-15',
    estimatedCompletion: '2024-08-15'
  },
  {
    id: 2,
    name: 'Reserva de emergência',
    targetAmount: 10000,
    currentAmount: 7500,
    status: 'active',
    createdAt: '2024-02-01',
    estimatedCompletion: '2024-07-01'
  },
  {
    id: 3,
    name: 'Notebook novo',
    targetAmount: 3000,
    currentAmount: 3000,
    status: 'completed',
    createdAt: '2023-12-01',
    estimatedCompletion: '2024-03-01'
  }
];

// Mock data para o gráfico de evolução
const chartData = [
  { mes: 'Jan', economia: 800 },
  { mes: 'Fev', economia: 1200 },
  { mes: 'Mar', economia: 950 },
  { mes: 'Abr', economia: 1400 },
  { mes: 'Mai', economia: 1100 },
  { mes: 'Jun', economia: 1300 },
];

const Goals = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [goals, setGoals] = useState(mockGoals);

  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    return goal.status === filter;
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
    const monthlyAverage = 1000; // Assumindo economia média de R$ 1000/mês
    const monthsRemaining = Math.ceil(remaining / monthlyAverage);
    
    if (remaining <= 0) return 'Meta alcançada!';
    if (monthsRemaining === 1) return '1 mês';
    return `${monthsRemaining} meses`;
  };

  const handleGoalAction = (goalId: number, action: string) => {
    console.log(`Ação ${action} para meta ${goalId}`);
    // Implementar ações como editar, excluir, etc.
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-mango-900 mb-2">Minhas Metas</h1>
          <p className="text-mango-600">Acompanhe seu progresso e alcance seus objetivos financeiros</p>
        </div>
        <Button className="bg-mango-500 hover:bg-mango-600 text-white">
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
          Todas
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'bg-mango-500 hover:bg-mango-600' : 'border-mango-200 text-mango-700 hover:bg-mango-50'}
        >
          Ativas
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
          className={filter === 'completed' ? 'bg-mango-500 hover:bg-mango-600' : 'border-mango-200 text-mango-700 hover:bg-mango-50'}
        >
          Concluídas
        </Button>
      </div>

      {/* Lista de Metas */}
      <div className="grid gap-4">
        {filteredGoals.map((goal) => (
          <Card key={goal.id} className="border-mango-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-mango-100 rounded-full">
                    <Target className="w-5 h-5 text-mango-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-mango-900">{goal.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-mango-600 mt-1">
                      <span>Meta: {formatCurrency(goal.targetAmount)}</span>
                      <span>•</span>
                      <span>Atual: {formatCurrency(goal.currentAmount)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {goal.status === 'completed' && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Concluída
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
                      {goal.status === 'active' && (
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
                    {calculateProgress(goal.currentAmount, goal.targetAmount).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={calculateProgress(goal.currentAmount, goal.targetAmount)} 
                  className="h-3 bg-mango-100" 
                />
              </div>

              {/* Informações adicionais */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1 text-mango-600">
                  <Calendar className="w-4 h-4" />
                  <span>Previsão: {calculateEstimatedTime(goal.currentAmount, goal.targetAmount)}</span>
                </div>
                <div className="text-mango-600">
                  Faltam: {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico de Evolução */}
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
              <LineChart data={chartData}>
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
    </div>
  );
};

export default Goals;
