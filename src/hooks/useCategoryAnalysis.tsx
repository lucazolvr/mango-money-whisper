import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CategoryAnalysis {
  categoria_nome: string;
  total_gasto: number;
  percentual: number;
  quantidade_transacoes: number;
}

export const useCategoryAnalysis = (periodoDias: number = 30) => {
  const [analysis, setAnalysis] = useState<CategoryAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAnalysis = async () => {
    if (!user) {
      setAnalysis([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('analise_gastos_categoria', {
        user_id_param: user.id,
        periodo_dias: periodoDias
      });

      if (error) {
        console.error('Erro ao buscar análise de categorias:', error);
        setError(error.message);
        return;
      }

      const formattedData = (data || []).map((item: any) => ({
        categoria_nome: item.categoria_nome || 'Sem categoria',
        total_gasto: Number(item.total_gasto) || 0,
        percentual: Number(item.percentual) || 0,
        quantidade_transacoes: Number(item.quantidade_transacoes) || 0
      }));

      setAnalysis(formattedData);
    } catch (error) {
      console.error('Erro ao buscar análise de categorias:', error);
      setError('Erro ao carregar análise de categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [user, periodoDias]);

  return {
    analysis,
    loading,
    error,
    refetch: fetchAnalysis
  };
};