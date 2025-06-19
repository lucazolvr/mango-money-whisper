
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePluggy } from './usePluggy';
import type { BankTransaction } from './useBankTransactions';

type UseBankTransactionsQueryProps = {
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
  enabled = true,
  onData,
  onError,
}: UseBankTransactionsQueryProps): UseBankTransactionsQueryResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { getAccounts, getTransactions } = usePluggy();
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
      // Obter credenciais do localStorage
      const stored = localStorage.getItem('pluggy_credentials');
      if (!stored) {
        throw new Error('Credenciais Pluggy não configuradas');
      }
      
      const credentials = JSON.parse(stored);
      if (!credentials.itemIds) {
        throw new Error('Item IDs não configurados');
      }

      console.log('🔍 Buscando contas para Item IDs:', credentials.itemIds);
      
      // Buscar todas as contas dos Item IDs configurados
      const accounts = await getAccounts(credentials.itemIds);
      
      if (accounts.length === 0) {
        console.warn('⚠️ Nenhuma conta encontrada');
        onData?.([]);
        return;
      }

      console.log(`🏦 Encontradas ${accounts.length} contas, buscando transações...`);
      
      // Buscar transações de todas as contas encontradas
      let allTransactions: BankTransaction[] = [];
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6); // Últimos 6 meses
      const startDateStr = startDate.toISOString().split('T')[0];
      
      for (const account of accounts) {
        try {
          console.log(`💰 Buscando transações da conta: ${account.name} (${account.id})`);
          const result = await getTransactions(account.id, startDateStr);
          
          if (result && result.transactions && Array.isArray(result.transactions)) {
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
                accountId: account.id,
                accountName: account.name
              };
            });
            
            allTransactions = [...allTransactions, ...formattedTransactions];
            console.log(`✅ ${account.name}: ${formattedTransactions.length} transações`);
          }
        } catch (accountError) {
          console.error(`❌ Erro na conta ${account.name}:`, accountError);
        }
      }

      if (!isUnmountedRef.current) {
        console.log(`🎉 Total de transações encontradas: ${allTransactions.length}`);
<<<<<<< HEAD
        onData?.(allTransactions);
=======
        onData?(allTransactions);
>>>>>>> 2f1e68d652805b0c0a47d46929bbc7571e9cbafb
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
  }, [user?.id, enabled, getAccounts, getTransactions, onData, onError, isLoading]);

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