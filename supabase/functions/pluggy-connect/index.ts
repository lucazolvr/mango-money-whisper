
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pluggy Client implementação simplificada
class PluggyClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async getAccessToken(): Promise<string> {
    // Verificar se o token ainda é válido (com margem de 5 minutos)
    if (this.accessToken && Date.now() < this.tokenExpiry - 300000) {
      return this.accessToken;
    }

    console.log('Obtendo novo token de acesso do Pluggy...');
    
    const response = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao obter token:', errorText);
      throw new Error(`Erro de autenticação Pluggy: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Diferentes estruturas possíveis de resposta
    this.accessToken = data.accessToken || data.access_token || data.token || data.apiKey;
    
    if (!this.accessToken) {
      console.error('Estrutura da resposta:', JSON.stringify(data, null, 2));
      throw new Error('Token de acesso não encontrado na resposta da API');
    }

    // Definir expiração (padrão 2 horas se não informado)
    const expiresIn = data.expiresIn || data.expires_in || 7200;
    this.tokenExpiry = Date.now() + (expiresIn * 1000);
    
    console.log('Token obtido com sucesso');
    return this.accessToken;
  }

  async fetchAccounts(itemId: string) {
    const token = await this.getAccessToken();
    
    console.log('Buscando contas para item:', itemId);
    
    const response = await fetch(`https://api.pluggy.ai/accounts?itemId=${itemId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao buscar contas:', errorText);
      throw new Error(`Erro ao buscar contas: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Encontradas ${data.results?.length || 0} contas`);
    
    return {
      results: data.results || [],
      total: data.total || 0,
      hasError: false,
      errors: {},
    };
  }

  async fetchAccount(accountId: string) {
    const token = await this.getAccessToken();
    
    console.log('Buscando conta:', accountId);
    
    const response = await fetch(`https://api.pluggy.ai/accounts/${accountId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao buscar conta:', errorText);
      throw new Error(`Erro ao buscar conta: ${response.status} - ${errorText}`);
    }

    const account = await response.json();
    console.log('Conta encontrada:', account.id);
    
    return {
      ...account,
      hasError: false,
      errors: {},
    };
  }

  async fetchTransactions(accountId: string, options: { from?: string; to?: string; pageSize?: number; page?: number } = {}) {
    const token = await this.getAccessToken();
    
    const params = new URLSearchParams({
      accountId,
      ...(options.from && { from: options.from }),
      ...(options.to && { to: options.to }),
      ...(options.pageSize && { pageSize: options.pageSize.toString() }),
      ...(options.page && { page: options.page.toString() }),
    });
    
    console.log('Buscando transações com parâmetros:', params.toString());
    
    const response = await fetch(`https://api.pluggy.ai/transactions?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao buscar transações:', errorText);
      throw new Error(`Erro ao buscar transações: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Encontradas ${data.results?.length || 0} transações`);
    
    return {
      results: data.results || [],
      total: data.total || 0,
      totalPages: data.totalPages || 1,
      page: data.page || 1,
      hasError: false,
      errors: {},
    };
  }

  async fetchItem(itemId: string) {
    const token = await this.getAccessToken();
    
    console.log('Buscando item:', itemId);
    
    const response = await fetch(`https://api.pluggy.ai/items/${itemId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao buscar item:', errorText);
      throw new Error(`Erro ao buscar item: ${response.status} - ${errorText}`);
    }

    const item = await response.json();
    console.log('Item encontrado:', item.id);
    
    return item;
  }
}

let pluggyClient: PluggyClient | null = null;

function getPluggyClient(clientId: string, clientSecret: string): PluggyClient {
  if (!pluggyClient || pluggyClient['clientId'] !== clientId) {
    pluggyClient = new PluggyClient(clientId, clientSecret);
  }
  return pluggyClient;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data, credentials } = await req.json();
    
    // Usar credenciais do frontend ou variáveis de ambiente como fallback
    const pluggyClientId = credentials?.clientId || Deno.env.get('PLUGGY_CLIENT_ID');
    const pluggyClientSecret = credentials?.clientSecret || Deno.env.get('PLUGGY_CLIENT_SECRET');
    
    if (!pluggyClientId || !pluggyClientSecret) {
      throw new Error('Credenciais do Pluggy não configuradas');
    }

    console.log('Processando ação:', action);
    console.log('Credenciais configuradas:', {
      clientId: pluggyClientId ? 'configurado' : 'não configurado',
      clientSecret: pluggyClientSecret ? 'configurado' : 'não configurado',
      source: credentials ? 'frontend' : 'environment'
    });

    const client = getPluggyClient(pluggyClientId, pluggyClientSecret);

    switch (action) {
      case 'status':
        return new Response(JSON.stringify({ 
          status: 'ok',
          data: {
            configured: !!(pluggyClientId && pluggyClientSecret)
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'getAccounts':
        // Buscar contas usando itemIds (pode ser múltiplos separados por vírgula)
        const itemIds = data.itemIds || data.itemId;
        if (!itemIds) {
          throw new Error('Item ID(s) não fornecido(s)');
        }

        const itemIdList = itemIds.split(',').map((id: string) => id.trim()).filter(Boolean);
        let allAccounts: any[] = [];

        for (const itemId of itemIdList) {
          try {
            const accountsResponse = await client.fetchAccounts(itemId);
            allAccounts = allAccounts.concat(accountsResponse.results);
          } catch (error) {
            console.error(`Erro ao buscar contas para item ${itemId}:`, error.message);
            // Continuar com outros items mesmo se um falhar
          }
        }

        return new Response(JSON.stringify({ 
          status: 'ok',
          data: {
            accounts: allAccounts
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'getTransactions':
        // Buscar transações de uma conta específica
        const { accountId, from, to, startDate } = data;
        
        if (!accountId) {
          throw new Error('Account ID não fornecido');
        }

        // Usar startDate como from se não fornecido
        const fromDate = from || startDate;
        
        try {
          const account = await client.fetchAccount(accountId);
          
          // Verificar se é conta sandbox (como no Actual)
          const sandboxAccount = account.owner === 'John Doe';
          const finalFromDate = sandboxAccount ? '2000-01-01' : fromDate;
          
          // Buscar todas as transações paginadas
          let allTransactions: any[] = [];
          let page = 1;
          let hasMorePages = true;
          
          while (hasMorePages) {
            const transactionsResponse = await client.fetchTransactions(accountId, {
              from: finalFromDate,
              to,
              pageSize: 500,
              page
            });
            
            const transactions = transactionsResponse.results.map((trans: any) => {
              if (sandboxAccount) {
                return { ...trans, sandbox: true };
              }
              return trans;
            });
            
            allTransactions = allTransactions.concat(transactions);
            
            hasMorePages = page < transactionsResponse.totalPages;
            page++;
          }

          // Calcular saldo inicial
          let startingBalance = Math.round(account.balance * 100);
          if (account.type === 'CREDIT') {
            startingBalance = -startingBalance;
          }

          const balances = [
            {
              balanceAmount: {
                amount: startingBalance,
                currency: account.currencyCode || 'BRL',
              },
              balanceType: 'expected',
              referenceDate: new Date(account.updatedAt).toISOString().split('T')[0],
            },
          ];

          return new Response(JSON.stringify({ 
            status: 'ok',
            data: {
              transactions: allTransactions,
              account,
              balances,
              startingBalance
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Erro ao buscar transações:', error);
          throw error;
        }

      case 'getItemById':
        const { itemId } = data;
        if (!itemId) {
          throw new Error('Item ID não fornecido');
        }

        const item = await client.fetchItem(itemId);
        
        return new Response(JSON.stringify({ 
          status: 'ok',
          data: {
            item
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Ação não reconhecida: ${action}`);
    }

  } catch (error) {
    console.error('Erro na função Pluggy:', error);
    return new Response(JSON.stringify({ 
      status: 'error',
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
