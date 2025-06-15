
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePluggy } from './usePluggy';
import type { BankTransaction } from './useBankTransactions';

type UseBankTransactionsQueryProps = {
  accountId?: string;
  enabled?: boolean;
  onData?: (transactions: BankTransaction[]) => void;
  onError?: (error: string) => void;
};

type UseBankTransactionsQueryResult = {
  isLoading: boolean;
  error: string | null;
  reload: () => void;
};

export function useBankTransactionsQuery({
  accountId,
  enabled = true,
  onData,
  onError,
}: UseBankTransactionsQueryProps): UseBankTransactionsQueryResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { getTransactions } = usePluggy();
  const hasExecutedRef = useRef(false);
  const isUnmountedRef = useRef(false);

  const fetchBankTransactions = useCallback(async () => {
    if (!user || !enabled) {
      console.log('🚫 Condições não atendidas para buscar transações bancárias');
      onData?.([]);
      return;
    }

    if (hasExecutedRef.current && isLoading) {
      console.log('🔄 Já está carregando, pulando nova execução');
      return;
    }
    
    hasExecutedRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      // Usar accountId fixo por enquanto se não fornecido
      const targetAccountId = accountId || '566ed8f2-1fef-4537-8c21-228525715958';
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6); // Últimos 6 meses
      
      console.log('🏦 Buscando transações bancárias para conta:', targetAccountId);
      const result = await getTransactions(targetAccountId, startDate.toISOString().split('T')[0]);
      
      if (!isUnmountedRef.current && result && result.transactions && Array.isArray(result.transactions)) {
        console.log('✅ Transações bancárias encontradas:', result.transactions.length);
        
        const formattedTransactions: BankTransaction[] = result.transactions.map((transaction: any) => {
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
        
        onData?.(formattedTransactions);
        console.log('💰 Transações formatadas:', formattedTransactions.length);
      } else if (!isUnmountedRef.current) {
        console.warn('⚠️ Nenhuma transação bancária encontrada ou formato inválido');
        onData?.([]);
      }
    } catch (error: any) {
      if (!isUnmountedRef.current) {
        console.error('❌ Erro ao buscar transações bancárias:', error);
        const errorMessage = error.message || 'Erro ao carregar transações bancárias';
        setError(errorMessage);
        onError?.(errorMessage);
        onData?.([]); // Definir array vazio em caso de erro
      }
    } finally {
      if (!isUnmountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user?.id, accountId, enabled, getTransactions, onData, onError, isLoading]);

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (user && enabled && !hasExecutedRef.current) {
      fetchBankTransactions();
    }
  }, [user, enabled, fetchBankTransactions]);

  const reload = useCallback(() => {
    hasExecutedRef.current = false;
    fetchBankTransactions();
  }, [fetchBankTransactions]);

  return {
    isLoading,
    error,
    reload
  };
}
