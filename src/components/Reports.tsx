
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Jan', receitas: 3000, gastos: 2200, economia: 800 },
  { month: 'Fev', receitas: 3500, gastos: 2800, economia: 700 },
  { month: 'Mar', receitas: 2800, gastos: 2400, economia: 400 },
  { month: 'Abr', receitas: 4200, gastos: 2600, economia: 1600 },
  { month: 'Mai', receitas: 3800, gastos: 2200, economia: 1600 },
];

const Reports = () => {
  const currentMonth = {
    budget: 2500,
    spent: 1800,
    remaining: 700,
    savingsGoal: 1000,
    actualSavings: 700,
  };

  const insights = [
    {
      type: 'positive',
      icon: TrendingUp,
      title: 'Economia em alta! 📈',
      description: 'Você economizou 22% mais que o mês passado. Continue assim!',
      color: 'green'
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Atenção aos gastos com transporte',
      description: 'Seus gastos com transporte aumentaram 15% este mês.',
      color: 'yellow'
    },
    {
      type: 'info',
      icon: Target,
      title: 'Meta de economia',
      description: 'Faltam apenas R$ 300 para atingir sua meta mensal!',
      color: 'blue'
    },
    {
      type: 'tip',
      icon: Calendar,
      title: 'Próximos vencimentos',
      description: 'Você tem 3 contas vencendo na próxima semana.',
      color: 'purple'
    }
  ];

  const getInsightColor = (color: string) => {
    const colors = {
      green: 'border-green-200 bg-green-50 text-green-700',
      yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700',
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      purple: 'border-purple-200 bg-purple-50 text-purple-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho com resumo mensal */}
      <div className="bg-gradient-to-r from-mango-500 to-mango-600 rounded-3xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Relatório Mensal - Maio 2024</h2>
        <p className="text-mango-100 mb-6">Aqui está como foi seu mês financeiro</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Orçamento Usado</span>
              <span className="text-lg font-bold">{Math.round((currentMonth.spent / currentMonth.budget) * 100)}%</span>
            </div>
            <Progress value={(currentMonth.spent / currentMonth.budget) * 100} className="mb-2" />
            <p className="text-xs text-mango-100">R$ {currentMonth.remaining.toLocaleString('pt-BR')} restantes</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Meta de Economia</span>
              <span className="text-lg font-bold">{Math.round((currentMonth.actualSavings / currentMonth.savingsGoal) * 100)}%</span>
            </div>
            <Progress value={(currentMonth.actualSavings / currentMonth.savingsGoal) * 100} className="mb-2" />
            <p className="text-xs text-mango-100">R$ {(currentMonth.savingsGoal - currentMonth.actualSavings).toLocaleString('pt-BR')} para a meta</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <span className="text-sm block mb-1">Comparação com mês anterior</span>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-lg font-bold">+22%</span>
            </div>
            <p className="text-xs text-mango-100">Economia maior</p>
          </div>
        </div>
      </div>

      {/* Gráfico de evolução mensal */}
      <Card className="border-mango-200">
        <CardHeader>
          <CardTitle className="text-mango-900">Evolução dos Últimos 5 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" stroke="#c2410c" />
                <YAxis stroke="#c2410c" tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip 
                  formatter={(value, name) => [`R$ ${value}`, name === 'receitas' ? 'Receitas' : name === 'gastos' ? 'Gastos' : 'Economia']}
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

      {/* Insights Personalizados */}
      <Card className="border-mango-200">
        <CardHeader>
          <CardTitle className="text-mango-900">Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Projeções */}
      <Card className="border-mango-200">
        <CardHeader>
          <CardTitle className="text-mango-900">Projeções para o Próximo Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">R$ 2.650</div>
              <p className="text-blue-700 font-medium">Saldo Projetado</p>
              <p className="text-sm text-blue-600 mt-1">Baseado nos seus hábitos</p>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
              <p className="text-green-700 font-medium">Chance de Meta</p>
              <p className="text-sm text-green-600 mt-1">Probabilidade de atingir sua meta</p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">R$ 1.200</div>
              <p className="text-purple-700 font-medium">Economia Estimada</p>
              <p className="text-sm text-purple-600 mt-1">Se manter o ritmo atual</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dicas Personalizadas */}
      <Card className="border-mango-200 bg-mango-50">
        <CardHeader>
          <CardTitle className="text-mango-900">💡 Dicas do Mango para Você</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl">
              <h4 className="font-semibold text-mango-900 mb-2">Otimize seus gastos com transporte</h4>
              <p className="text-sm text-gray-600">Que tal tentar usar transporte público 2x por semana? Você pode economizar até R$ 120/mês!</p>
            </div>
            
            <div className="p-4 bg-white rounded-xl">
              <h4 className="font-semibold text-mango-900 mb-2">Automatize suas economias</h4>
              <p className="text-sm text-gray-600">Configure uma transferência automática de R$ 300 todo dia 5. Assim você economiza sem sentir!</p>
            </div>
            
            <div className="p-4 bg-white rounded-xl">
              <h4 className="font-semibold text-mango-900 mb-2">Revise suas assinaturas</h4>
              <p className="text-sm text-gray-600">Você tem 4 assinaturas ativas. Cancelando 1 que você pouco usa, economaria R$ 40/mês.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
