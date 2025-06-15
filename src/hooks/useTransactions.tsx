
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBankTransactionsQuery } from './useBankTransactionsQuery';
import type { BankTransaction } from './useBankTransactions';

export interface Transaction {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  data: string;
  categoria_id?: string;
  isBankTransaction?: boolean;
  accountId?: string;
  accountName?: string;
}

export const useTransactions = () => {
  const [manualTransactions, setManualTransactions] = useState<Transaction[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [manualLoading, setManualLoading] = useState(true);
  const { user } = useAuth();

  // Hook para transações bancárias com callback pattern
  const { isLoading: bankLoading, error: bankError, reload: reloadBank } = useBankTransactionsQuery({
    enabled: !!user,
    onData: (transactions) => {
      console.log('📊 Transações bancárias recebidas via callback:', transactions.length);
      setBankTransactions(transactions);
    },
    onError: (error) => {
      console.error('📊 Erro nas transações bancárias via callback:', error);
      setBankTransactions([]);
    }
  });

  const fetchManualTransactions = async () => {
    if (!user) {
      setManualTransactions([]);
      setManualLoading(false);
      return;
    }
    
    try {
      setManualLoading(true);
      const { data, error } = await supabase
        .from('transacoes')
        .select(`
          *,
          categorias(nome)
        `)
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao buscar transações manuais:', error);
        return;
      }

      const formattedTransactions = data?.map(t => ({
        id: t.id,
        descricao: t.descricao,
        valor: Number(t.valor),
        tipo: t.tipo as 'receita' | 'despesa',
        categoria: t.categorias?.nome || 'Sem categoria',
        data: t.data,
        categoria_id: t.categoria_id,
        isBankTransaction: false
      })) || [];

      setManualTransactions(formattedTransactions);
    } catch (error) {
      console.error('Erro ao buscar transações manuais:', error);
    } finally {
      setManualLoading(false);
    }
  };

  // Combinar transações manuais e bancárias
  const transactions = useMemo(() => {
    return [...manualTransactions, ...bankTransactions]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [manualTransactions, bankTransactions]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'categoria'> & { categoria_id: string }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transacoes')
        .insert({
          user_id: user.id,
          descricao: transaction.descricao,
          valor: transaction.valor,
          tipo: transaction.tipo,
          categoria_id: transaction.categoria_id,
          data: transaction.data
        });

      if (error) {
        console.error('Erro ao adicionar transação:', error);
        throw error;
      }

      await fetchManualTransactions();
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchManualTransactions();
  }, [user]);

  return {
    transactions,
    loading: manualLoading || bankLoading,
    error: bankError,
    addTransaction,
    refetch: () => {
      fetchManualTransactions();
      reloadBank();
    }
  };
};
