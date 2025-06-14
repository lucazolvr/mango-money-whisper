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
  currencyCode?: string;
  owner?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: string;
  category: string;
  descriptionRaw?: string;
  merchant?: {
    name?: string;
    businessName?: string;
  };
  paymentData?: {
    receiver?: {
      name?: string;
      documentNumber?: { value?: string };
    };
    payer?: {
      name?: string;
      documentNumber?: { value?: string };
    };
  };
  currencyCode?: string;
  amountInAccountCurrency?: number;
  status?: string;
  sandbox?: boolean;
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

  const checkStatus = async (): Promise<boolean> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      const credentials = getStoredCredentials();
      
      const { data, error } = await supabase.functions.invoke('pluggy-connect', {
        body: { 
          action: 'status',
          credentials
        }
      });

      if (error) throw error;
      
      return data.data?.configured || false;
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return false;
    }
  };

  const getAccounts = async (itemIds: string): Promise<Account[]> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    try {
      const credentials = getStoredCredentials();
      
      console.log('Buscando contas com credenciais:', {
        clientId: credentials.clientId ? 'configurado' : 'não configurado',
        clientSecret: credentials.clientSecret ? 'configurado' : 'não configurado',
        itemIds: itemIds
      });
      
      const { data, error } = await supabase.functions.invoke('pluggy-connect', {
        body: { 
          action: 'getAccounts',
          credentials,
          data: { itemIds }
        }
      });

      if (error) {
        console.error('Erro na chamada da função:', error);
        throw error;
      }
      
      console.log('Resposta da função pluggy-connect:', data);
      
      if (data.status === 'error') {
        console.error('Erro retornado pela função:', data.error);
        throw new Error(data.error);
      }
      
      const accounts = data.data?.accounts || [];
      console.log(`Encontradas ${accounts.length} contas:`, accounts);
      
      if (accounts.length === 0) {
        console.warn('Nenhuma conta encontrada. Verificando Item IDs:', itemIds);
        toast({
          title: "Aviso",
          description: `Nenhuma conta encontrada para os Item IDs fornecidos. Verifique se os IDs estão corretos: ${itemIds}`,
          variant: "destructive",
        });
      }
      
      return accounts;
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Erro",
        description: `Não foi possível carregar as contas: ${errorMessage}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTransactions = async (accountId: string, startDate?: string, endDate?: string): Promise<{
    transactions: Transaction[];
    account: Account;
    balances: any[];
    startingBalance: number;
  }> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    try {
      const credentials = getStoredCredentials();
      
      const { data, error } = await supabase.functions.invoke('pluggy-connect', {
        body: { 
          action: 'getTransactions',
          credentials,
          data: { 
            accountId, 
            startDate,
            to: endDate
          }
        }
      });

      if (error) throw error;
      
      if (data.status === 'error') {
        throw new Error(data.error);
      }
      
      return {
        transactions: data.data?.transactions || [],
        account: data.data?.account,
        balances: data.data?.balances || [],
        startingBalance: data.data?.startingBalance || 0
      };
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      toast({
        title: "Erro",
        description: `Não foi possível carregar as transações: ${error.message}`,
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
          action: 'getItemById',
          credentials,
          data: { itemId }
        }
      });

      if (error) throw error;
      
      if (data.status === 'error') {
        throw new Error(data.error);
      }
      
      return data.data?.item;
    } catch (error) {
      console.error('Erro ao buscar item:', error);
      toast({
        title: "Erro",
        description: `Não foi possível encontrar o item: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    checkStatus,
    getAccounts,
    getTransactions,
    getItemById
  };
};
