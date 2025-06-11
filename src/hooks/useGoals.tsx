
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Goal {
  id: string;
  titulo: string;
  descricao?: string;
  valor_alvo: number;
  valor_atual: number;
  data_limite?: string;
  status: 'ativa' | 'concluida' | 'pausada';
  created_at: string;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGoals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('metas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar metas:', error);
        return;
      }

      setGoals(data || []);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'valor_atual' | 'created_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('metas')
        .insert({
          user_id: user.id,
          titulo: goal.titulo,
          descricao: goal.descricao,
          valor_alvo: goal.valor_alvo,
          data_limite: goal.data_limite,
          status: goal.status
        });

      if (error) {
        console.error('Erro ao adicionar meta:', error);
        throw error;
      }

      await fetchGoals();
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
      throw error;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('metas')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar meta:', error);
        throw error;
      }

      await fetchGoals();
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    refetch: fetchGoals
  };
};
