
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Connector {
  id: number;
  name: string;
  imageUrl: string;
  type: string;
  country: string;
}

export interface Account {
  id: string;
  name: string;
  number: string;
  balance: number;
  type: string;
  subtype: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: string;
  category: string;
}

export const usePluggy = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const getStoredCredentials = () => {
    const stored = localStorage.getItem('pluggy_credentials');
    if (!stored) {
      throw new Error('Credenciais Pluggy não configuradas');
    }
    return JSON.parse(stored);
  };

  const getConnectors = async (): Promise<Connector[]> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    try {
      const credentials = getStoredCredentials();
      
      const { data, error } = await supabase.functions.invoke('pluggy-connect', {
        body: { 
          action: 'getConnectors',
          credentials
        }
      });

      if (error) throw error;
      
      return data.connectors || [];
    } catch (error) {
      console.error('Erro ao buscar conectores:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os bancos disponíveis",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const connectBank = async (connectorId: number, connectorName: string, parameters: any) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    try {
      const credentials = getStoredCredentials();
      
      const { data, error } = await supabase.functions.invoke('pluggy-connect', {
        body: { 
          action: 'createItem',
          credentials,
          data: {
            connectorId,
            connectorName,
            parameters,
            userId: user.id
          }
        }
      });

      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: "Banco conectado com sucesso",
      });
      
      return data.item;
    } catch (error) {
      console.error('Erro ao conectar banco:', error);
      toast({
        title: "Erro",
        description: "Não foi possível conectar ao banco",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getItemById = async (itemId: string) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    try {
      const credentials = getStoredCredentials();
      
      const { data, error } = await supabase.functions.invoke('pluggy-connect', {
        body: { 
          action: 'getItemsByItemId',
          credentials,
          data: { itemId }
        }
      });

      if (error) throw error;
      
      return data.item;
    } catch (error) {
      console.error('Erro ao buscar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível encontrar o item",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAccounts = async (itemId: string): Promise<Account[]> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    try {
      const credentials = getStoredCredentials();
      
      const { data, error } = await supabase.functions.invoke('pluggy-connect', {
        body: { 
          action: 'getAccounts',
          credentials,
          data: { itemId }
        }
      });

      if (error) throw error;
      
      return data.accounts || [];
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as contas",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTransactions = async (accountId: string, from: string, to: string): Promise<Transaction[]> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    try {
      const credentials = getStoredCredentials();
      
      const { data, error } = await supabase.functions.invoke('pluggy-connect', {
        body: { 
          action: 'getTransactions',
          credentials,
          data: { accountId, from, to }
        }
      });

      if (error) throw error;
      
      return data.transactions || [];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getConnectors,
    connectBank,
    getItemById,
    getAccounts,
    getTransactions
  };
};
