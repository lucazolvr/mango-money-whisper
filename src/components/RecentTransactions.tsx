
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const transactions = [
  {
    id: 1,
    description: 'Freelance - Design Logo',
    amount: 800.00,
    type: 'income',
    category: 'Trabalho',
    date: '2024-05-25',
  },
  {
    id: 2,
    description: 'Supermercado Pão de Açúcar',
    amount: -120.50,
    type: 'expense',
    category: 'Alimentação',
    date: '2024-05-25',
  },
  {
    id: 3,
    description: 'Uber - Centro',
    amount: -18.90,
    type: 'expense',
    category: 'Transporte',
    date: '2024-05-24',
  },
  {
    id: 4,
    description: 'Pagamento Cliente Maria',
    amount: 450.00,
    type: 'income',
    category: 'Trabalho',
    date: '2024-05-24',
  },
  {
    id: 5,
    description: 'Netflix',
    amount: -32.90,
    type: 'expense',
    category: 'Lazer',
    date: '2024-05-23',
  },
];

export const RecentTransactions = () => {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              transaction.type === 'income' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {transaction.type === 'income' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{transaction.description}</p>
              <p className="text-sm text-gray-500">{transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <div className={`text-lg font-semibold ${
            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.type === 'income' ? '+' : ''}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      ))}
    </div>
  );
};
