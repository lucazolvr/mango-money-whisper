
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Agendamento {
  id: string;
  user_id: string;
  categoria_id?: string;
  titulo: string;
  descricao?: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  data_vencimento: string;
  recorrencia: 'unica' | 'semanal' | 'mensal' | 'anual';
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  notificacao_enviada: boolean;
  dias_antecedencia: number;
  created_at: string;
  updated_at: string;
}

export const useAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAgendamentos = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      setAgendamentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAgendamento = async (agendamento: Omit<Agendamento, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .insert([{ ...agendamento, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setAgendamentos(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento.",
        variant: "destructive",
      });
    }
  };

  const updateAgendamento = async (id: string, updates: Partial<Agendamento>) => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAgendamentos(prev => prev.map(a => a.id === id ? data : a));
      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento.",
        variant: "destructive",
      });
    }
  };

  const deleteAgendamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAgendamentos(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Sucesso",
        description: "Agendamento excluído com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o agendamento.",
        variant: "destructive",
      });
    }
  };

  const marcarComoPago = async (id: string) => {
    await updateAgendamento(id, { status: 'pago' });
  };

  const getAgendamentosProximosVencimento = () => {
    const hoje = new Date();
    const proximosDias = new Date();
    proximosDias.setDate(hoje.getDate() + 7); // Próximos 7 dias

    return agendamentos.filter(agendamento => {
      const dataVencimento = new Date(agendamento.data_vencimento);
      return dataVencimento >= hoje && dataVencimento <= proximosDias && agendamento.status === 'pendente';
    });
  };

  const getAgendamentosAtrasados = () => {
    const hoje = new Date();
    return agendamentos.filter(agendamento => {
      const dataVencimento = new Date(agendamento.data_vencimento);
      return dataVencimento < hoje && agendamento.status === 'pendente';
    });
  };

  useEffect(() => {
    fetchAgendamentos();
  }, [user]);

  return {
    agendamentos,
    loading,
    createAgendamento,
    updateAgendamento,
    deleteAgendamento,
    marcarComoPago,
    getAgendamentosProximosVencimento,
    getAgendamentosAtrasados,
    refreshAgendamentos: fetchAgendamentos,
  };
};
