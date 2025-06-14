
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';

export const CategoryChart = () => {
  const { transactions } = useTransactions();

  // Calcular gastos por categoria
  const categoryData = React.useMemo(() => {
    const expenses = transactions.filter(t => t.tipo === 'despesa');
    const totalExpenses = expenses.reduce((sum, t) => sum + t.valor, 0);
    
    if (totalExpenses === 0) {
      return [];
    }

    const categoryTotals = expenses.reduce((acc, transaction) => {
      const category = transaction.categoria || 'Outros';
      acc[category] = (acc[category] || 0) + transaction.valor;
      return acc;
    }, {} as Record<string, number>);

    const colors = [
      '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5',
      '#ea580c', '#c2410c', '#9a3412', '#7c2d12', '#6c2e05'
    ];

    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value: Math.round((value / totalExpenses) * 100),
        realValue: value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Mostrar apenas top 6 categorias
  }, [transactions]);

  if (categoryData.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">Nenhum gasto registrado</p>
          <p className="text-sm">Adicione transações para ver o gráfico por categoria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, value }) => `${name} ${value}%`}
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => [
              `${value}% (R$ ${props.payload.realValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
              'Participação'
            ]}
            contentStyle={{
              backgroundColor: '#fff7ed',
              border: '1px solid #f97316',
              borderRadius: '8px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
