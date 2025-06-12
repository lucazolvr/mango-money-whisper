
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Goal {
  id: string;
  titulo: string;
  descricao: string | null;
  valor_alvo: number;
  valor_atual: number;
  data_limite: string | null;
  status: 'ativa' | 'concluida' | 'pausada';
  created_at: string;
  updated_at: string;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

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

      const typedGoals = (data || []).map(goal => ({
        id: goal.id,
        titulo: goal.titulo,
        descricao: goal.descricao,
        valor_alvo: Number(goal.valor_alvo),
        valor_atual: Number(goal.valor_atual || 0),
        data_limite: goal.data_limite,
        status: goal.status as 'ativa' | 'concluida' | 'pausada',
        created_at: goal.created_at,
        updated_at: goal.updated_at
      }));

      setGoals(typedGoals);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: Omit<Goal, 'id' | 'valor_atual' | 'status' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('metas')
        .insert({
          user_id: user.id,
          titulo: goalData.titulo,
          descricao: goalData.descricao,
          valor_alvo: goalData.valor_alvo,
          data_limite: goalData.data_limite,
          status: 'ativa'
        });

      if (error) {
        console.error('Erro ao criar meta:', error);
        toast({
          title: "Erro",
          description: "Não foi possível criar a meta",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Meta criada com sucesso",
      });

      await fetchGoals();
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      throw error;
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Omit<Goal, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('metas')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar meta:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a meta",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Meta atualizada com sucesso",
      });

      await fetchGoals();
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      throw error;
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('metas')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao excluir meta:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a meta",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Meta excluída com sucesso",
      });

      await fetchGoals();
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    refetch: fetchGoals
  };
};
