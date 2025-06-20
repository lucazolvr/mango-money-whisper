import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MonthlyReport {
  receitas: number;
  despesas: number;
  saldo: number;
  total_transacoes: number;
}

export const useMonthlyReport = (mes?: number, ano?: number) => {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const currentDate = new Date();
  const targetMonth = mes || currentDate.getMonth() + 1;
  const targetYear = ano || currentDate.getFullYear();

  const fetchReport = async () => {
    if (!user) {
      setReport(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('resumo_mensal_usuario', {
        user_id_param: user.id,
        mes_param: targetMonth,
        ano_param: targetYear
      });

      if (error) {
        console.error('Erro ao buscar relatório mensal:', error);
        setError(error.message);
        return;
      }

      if (data && data.length > 0) {
        const reportData = data[0];
        setReport({
          receitas: Number(reportData.receitas) || 0,
          despesas: Number(reportData.despesas) || 0,
          saldo: Number(reportData.saldo) || 0,
          total_transacoes: Number(reportData.total_transacoes) || 0
        });
      } else {
        setReport({
          receitas: 0,
          despesas: 0,
          saldo: 0,
          total_transacoes: 0
        });
      }
    } catch (error) {
      console.error('Erro ao buscar relatório mensal:', error);
      setError('Erro ao carregar relatório mensal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [user, targetMonth, targetYear]);

  return {
    report,
    loading,
    error,
    refetch: fetchReport,
    month: targetMonth,
    year: targetYear
  };
};