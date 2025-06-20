import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserStatistics {
  total_transacoes: number;
  total_receitas: number;
  total_despesas: number;
  saldo_atual: number;
  metas_ativas: number;
  metas_concluidas: number;
  agendamentos_pendentes: number;
  categoria_mais_usada: string;
  mes_mais_ativo: string;
}

export const useUserStatistics = () => {
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStatistics = async () => {
    if (!user) {
      setStatistics(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_user_statistics', {
        user_id_param: user.id
      });

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        setError(error.message);
        return;
      }

      if (data && data.length > 0) {
        const stats = data[0];
        setStatistics({
          total_transacoes: Number(stats.total_transacoes) || 0,
          total_receitas: Number(stats.total_receitas) || 0,
          total_despesas: Number(stats.total_despesas) || 0,
          saldo_atual: Number(stats.saldo_atual) || 0,
          metas_ativas: Number(stats.metas_ativas) || 0,
          metas_concluidas: Number(stats.metas_concluidas) || 0,
          agendamentos_pendentes: Number(stats.agendamentos_pendentes) || 0,
          categoria_mais_usada: stats.categoria_mais_usada || 'Nenhuma',
          mes_mais_ativo: stats.mes_mais_ativo || 'Nenhum'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setError('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [user]);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics
  };
};