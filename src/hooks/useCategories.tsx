
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Category {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string;
  icone: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCategories = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        return;
      }

      // Garantir que os tipos estão corretos
      const typedCategories = (data || []).map(cat => ({
        id: cat.id,
        nome: cat.nome,
        tipo: cat.tipo as 'receita' | 'despesa',
        cor: cat.cor,
        icone: cat.icone
      }));

      setCategories(typedCategories);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  return {
    categories,
    loading,
    refetch: fetchCategories
  };
};
