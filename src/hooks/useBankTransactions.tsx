
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePluggy } from './usePluggy';

export interface BankTransaction {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  data: string;
  categoria_id?: string;
  isBankTransaction: true;
  accountId: string;
  accountName: string;
}

export const useBankTransactions = () => {
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { getTransactions } = usePluggy();

  const fetchBankTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Por enquanto, vamos usar um accountId fixo dos logs
      // Em produção, isso viria das conexões bancárias do usuário
      const accountId = '566ed8f2-1fef-4537-8c21-228525715958';
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6); // Últimos 6 meses
      
      console.log('🏦 Buscando transações bancárias...');
      const result = await getTransactions(accountId, startDate.toISOString().split('T')[0]);
      
      // Acessar diretamente as propriedades do resultado
      if (result.transactions) {
        console.log('✅ Transações bancárias encontradas:', result.transactions.length);
        
        const formattedTransactions: BankTransaction[] = result.transactions.map((transaction: any) => {
          // Determinar se é receita ou despesa baseado no valor
          const isIncome = transaction.amount > 0;
          
          return {
            id: `bank_${transaction.id}`,
            descricao: transaction.description || 'Transação bancária',
            valor: Math.abs(transaction.amount / 100), // Converter de centavos para reais
            tipo: isIncome ? 'receita' : 'despesa',
            categoria: transaction.category || 'Bancário',
            data: transaction.date,
            isBankTransaction: true as const,
            accountId: transaction.accountId,
            accountName: result.account?.name || 'Conta Bancária'
          };
        });
        
        setBankTransactions(formattedTransactions);
        console.log('💰 Transações formatadas:', formattedTransactions);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar transações bancárias:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankTransactions();
  }, [user]);

  return {
    bankTransactions,
    loading,
    refetch: fetchBankTransactions
  };
};
