
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
    const credentials = JSON.parse(stored);
    
    // Validação mais rigorosa das credenciais
    if (!credentials.clientId || !credentials.clientSecret) {
      throw new Error('Client ID ou Client Secret não configurados');
    }
    
    console.log('🔑 Credenciais carregadas:', {
      clientId: credentials.clientId ? `${credentials.clientId.substring(0, 8)}...` : 'não definido',
      clientSecret: credentials.clientSecret ? 'definido' : 'não definido',
      itemIds: credentials.itemIds
    });
    
    return credentials;
  };

  const checkStatus = async (): Promise<boolean> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      const credentials = getStoredCredentials();
      
      console.log('🔍 Verificando status da conexão Pluggy...');
      
      const { data, error } = await supabase.functions.invoke('pluggy-connect', {
        body: { 
          action: 'status',
          credentials
        }
      });

      if (error) {
        console.error('❌ Erro na verificação de status:', error);
        throw error;        
      }
      
      const isConfigured = data.data?.configured || false;
      console.log('📊 Status da configuração:', isConfigured);
      
      return isConfigured;
    } catch (error) {
      console.error('💥 Erro ao verificar status:', error);
      return false;
    }
  };

  const getAccounts = async (itemIds: string): Promise<Account[]> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    try {
      const credentials = getStoredCredentials();
      
      console.log('🔍 Iniciando busca de contas...');
      console.log('🏦 Item IDs fornecidos:', itemIds);
      console.log('🔑 Usando credenciais:', {
        clientId: credentials.clientId ? `${credentials.clientId.substring(0, 8)}...` : 'não definido',
        clientSecret: credentials.clientSecret ? 'definido' : 'não definido'
      });
      
      const { data, error } = await supabase.functions.invoke('pluggy-connect', {
        body: { 
          action: 'getAccounts',
          credentials,
          data: { itemIds }
        }
      });

      if (error) {
        console.error('❌ Erro na chamada da função edge:', error);
        throw new Error(`Erro na função: ${error.message}`);
      }
      
      console.log('📝 Resposta completa da função:', JSON.stringify(data, null, 2));
      
      if (data.status === 'ok') {
        const responseData = data.data;
        
        // Verificar se houve erros
        if (responseData.hasError && responseData.errors) {
          const errorItems = Object.entries(responseData.errors);
          console.warn('⚠️ Erros encontrados:', responseData.errors);
          
          // Mostrar erros específicos por Item ID
          errorItems.forEach(([itemId, error]) => {
            console.warn(`❌ Item ${itemId}: ${error}`);
          });
          
          toast({
            title: "Problemas encontrados",
            description: `Alguns Item IDs tiveram problemas. Verifique o console para detalhes.`,
            variant: "destructive",
          });
        }
        
        const accounts = responseData.accounts || [];
        const summary = responseData.summary || {};
        
        console.log(`✅ Resultado final: ${accounts.length} contas encontradas`);
        console.log('📊 Resumo detalhado:', summary);
        
        if (accounts.length === 0) {
          const message = summary.processedItems > 0 
            ? `Nenhuma conta encontrada nos ${summary.processedItems} Item ID(s) fornecidos. Verifique se os Item IDs estão corretos e as contas estão conectadas no dashboard do Pluggy.`
            : 'Nenhuma conta encontrada. Verifique seus Item IDs no dashboard do Pluggy.';
            
          console.warn('⚠️ Nenhuma conta encontrada');
          toast({
            title: "Nenhuma conta encontrada",
            description: message,
            variant: "destructive",
          });
        } else {
          console.log('🏦 Contas encontradas:', accounts.map(acc => ({
            id: acc.id,
            name: acc.name,
            type: acc.type,
            balance: acc.balance,
            currency: acc.currencyCode
          })));
          
          toast({
            title: "Contas encontradas!",
            description: `${accounts.length} conta(s) encontrada(s) com sucesso.`,
          });
        }
        
        return accounts;
      } else {
        throw new Error(data.data?.error || 'Erro desconhecido na resposta');
      }
    } catch (error) {
      console.error('💥 Erro crítico ao buscar contas:', error);
      
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Erro ao buscar contas",
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
      
      console.log('🔍 Buscando transações:', { accountId, startDate, endDate });
      
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
      
      if (data.status === 'ok') {
        const responseData = data.data;
        
        if (responseData.hasError) {
          throw new Error(responseData.error || 'Erro ao buscar transações');
        }
        
        const summary = responseData.summary || {};
        console.log('📊 Resumo das transações:', summary);
        
        return {
          transactions: responseData.transactions || [],
          account: responseData.account,
          balances: responseData.balances || [],
          startingBalance: responseData.startingBalance || 0
        };
      } else {
        throw new Error(data.data?.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('💥 Erro ao buscar transações:', error);
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
