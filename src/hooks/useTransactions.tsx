
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Transaction {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  data: string;
  categoria_id?: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transacoes')
        .select(`
          *,
          categorias(nome)
        `)
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao buscar transações:', error);
        return;
      }

      const formattedTransactions = data?.map(t => ({
        id: t.id,
        descricao: t.descricao,
        valor: Number(t.valor),
        tipo: t.tipo as 'receita' | 'despesa',
        categoria: t.categorias?.nome || 'Sem categoria',
        data: t.data,
        categoria_id: t.categoria_id
      })) || [];

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };

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

      await fetchTransactions();
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return {
    transactions,
    loading,
    addTransaction,
    refetch: fetchTransactions
  };
};
