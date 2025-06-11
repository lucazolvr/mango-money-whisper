
import React from 'react';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';

export const RecentTransactions = () => {
  const { transactions, loading } = useTransactions();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-mango-500" />
      </div>
    );
  }

  const recentTransactions = transactions.slice(0, 5);

  if (recentTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma transação encontrada.</p>
        <p className="text-sm mt-2">Adicione sua primeira transação através do chat!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentTransactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              transaction.tipo === 'receita' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {transaction.tipo === 'receita' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{transaction.descricao}</p>
              <p className="text-sm text-gray-500">{transaction.categoria} • {new Date(transaction.data).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <div className={`text-lg font-semibold ${
            transaction.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.tipo === 'receita' ? '+' : ''}R$ {Math.abs(transaction.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      ))}
    </div>
  );
};
