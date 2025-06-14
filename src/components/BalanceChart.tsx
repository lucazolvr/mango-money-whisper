
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';

export const BalanceChart = () => {
  const { transactions } = useTransactions();

  // Gerar dados dos últimos 6 meses
  const chartData = React.useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    // Gerar os últimos 6 meses
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
      
      const saldo = receitas - gastos;
      
      months.push({
        name: date.toLocaleDateString('pt-BR', { month: 'short' }),
        saldo: Math.round(saldo),
        receitas: Math.round(receitas),
        gastos: Math.round(gastos)
      });
    }
    
    return months;
  }, [transactions]);

  // Calcular saldo acumulado
  const chartDataWithAccumulated = React.useMemo(() => {
    let accumulated = 0;
    return chartData.map(month => {
      accumulated += month.saldo;
      return {
        ...month,
        saldoAcumulado: accumulated
      };
    });
  }, [chartData]);

  if (transactions.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">Nenhuma transação registrada</p>
          <p className="text-sm">Adicione transações para ver a evolução do saldo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartDataWithAccumulated}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f97316" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            stroke="#c2410c"
            fontSize={12}
          />
          <YAxis 
            stroke="#c2410c"
            fontSize={12}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip 
            formatter={(value, name) => [
              `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
              name === 'Saldo Acumulado' ? 'Saldo Acumulado' : 'Saldo Mensal'
            ]}
            contentStyle={{
              backgroundColor: '#fff7ed',
              border: '1px solid #f97316',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="saldoAcumulado" 
            stroke="#f97316" 
            strokeWidth={3}
            dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#ea580c' }}
            name="Saldo Acumulado"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
