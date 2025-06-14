
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pluggy Client implementação seguindo o padrão do Actual Budget
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
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro ao buscar contas:', response.status, errorData);
      throw new Error(`Erro ao buscar contas: ${response.status} - ${errorData.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    console.log(`Resposta da API para item ${itemId}:`, JSON.stringify(data, null, 2));
    
    return {
      results: data.results || data || [],
      total: data.total || (data.results || data || []).length,
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
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro ao buscar conta:', response.status, errorData);
      throw new Error(`Erro ao buscar conta: ${response.status} - ${errorData.message || 'Erro desconhecido'}`);
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
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro ao buscar transações:', response.status, errorData);
      throw new Error(`Erro ao buscar transações: ${response.status} - ${errorData.message || 'Erro desconhecido'}`);
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
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro ao buscar item:', response.status, errorData);
      throw new Error(`Erro ao buscar item: ${response.status} - ${errorData.message || 'Erro desconhecido'}`);
    }

    const item = await response.json();
    console.log('Item encontrado:', item.id);
    
    return item;
  }
}

// Instância global do cliente (como no Actual)
let pluggyClient: PluggyClient | null = null;

function getPluggyClient(clientId: string, clientSecret: string): PluggyClient {
  if (!pluggyClient || pluggyClient['clientId'] !== clientId) {
    console.log('Criando nova instância do cliente Pluggy');
    pluggyClient = new PluggyClient(clientId, clientSecret);
  }
  return pluggyClient;
}

// Função para verificar se está configurado (como no Actual)
function isConfigured(clientId?: string, clientSecret?: string, itemIds?: string): boolean {
  return !!(clientId && clientSecret && itemIds);
}

// Função para buscar contas por Item ID (como no Actual)
async function getAccountsByItemId(client: PluggyClient, itemId: string) {
  try {
    console.log(`Buscando contas para Item ID: ${itemId}`);
    const result = await client.fetchAccounts(itemId);
    console.log(`Item ${itemId}: encontradas ${result.results.length} contas`);
    return result;
  } catch (error) {
    console.error(`Erro ao buscar contas para item ${itemId}:`, error.message);
    throw error;
  }
}

// Função para buscar todas as transações paginadas (como no Actual)
async function getAllTransactions(client: PluggyClient, accountId: string, startDate?: string) {
  let transactions: any[] = [];
  let page = 1;
  let hasMorePages = true;
  
  while (hasMorePages) {
    const result = await client.fetchTransactions(accountId, {
      from: startDate,
      pageSize: 500,
      page
    });
    
    transactions = transactions.concat(result.results);
    hasMorePages = page < result.totalPages;
    page++;
    
    console.log(`Página ${page - 1}/${result.totalPages}: ${result.results.length} transações`);
  }
  
  return transactions;
}

// Função para obter data no formato ISO (como no Actual)
function getDate(date: Date): string {
  return date.toISOString().split('T')[0];
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
    
    console.log('Processando ação:', action);
    console.log('Credenciais configuradas:', {
      clientId: pluggyClientId ? 'configurado' : 'não configurado',
      clientSecret: pluggyClientSecret ? 'configurado' : 'não configurado',
      source: credentials ? 'frontend' : 'environment'
    });

    switch (action) {
      case 'status':
        const configured = isConfigured(pluggyClientId, pluggyClientSecret, credentials?.itemIds);
        return new Response(JSON.stringify({ 
          status: 'ok',
          data: { configured }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'getAccounts':
        // Verificar configuração
        if (!isConfigured(pluggyClientId, pluggyClientSecret, data.itemIds)) {
          throw new Error('Credenciais do Pluggy não configuradas completamente');
        }

        const client = getPluggyClient(pluggyClientId!, pluggyClientSecret!);
        
        // Buscar contas usando itemIds (pode ser múltiplos separados por vírgula)
        const itemIds = data.itemIds || data.itemId;
        if (!itemIds) {
          throw new Error('Item ID(s) não fornecido(s)');
        }

        const itemIdList = itemIds.split(',').map((id: string) => id.trim()).filter(Boolean);
        console.log('Processando Item IDs:', itemIdList);
        
        let allAccounts: any[] = [];
        let hasErrors = false;
        const errors: Record<string, string> = {};

        for (const itemId of itemIdList) {
          try {
            const accountsResponse = await getAccountsByItemId(client, itemId);
            if (accountsResponse.results && accountsResponse.results.length > 0) {
              allAccounts = allAccounts.concat(accountsResponse.results);
              console.log(`✓ Item ${itemId}: ${accountsResponse.results.length} contas adicionadas`);
            } else {
              console.warn(`⚠ Item ${itemId}: nenhuma conta encontrada`);
              errors[itemId] = 'Nenhuma conta encontrada para este Item ID';
            }
          } catch (error) {
            console.error(`✗ Item ${itemId}: erro -`, error.message);
            hasErrors = true;
            errors[itemId] = error.message;
          }
        }

        console.log(`Resumo: ${allAccounts.length} contas encontradas no total`);
        console.log('Contas encontradas:', allAccounts.map(acc => ({ id: acc.id, name: acc.name, type: acc.type })));

        return new Response(JSON.stringify({ 
          status: 'ok',
          data: {
            accounts: allAccounts,
            hasError: hasErrors,
            errors: errors,
            summary: {
              totalAccounts: allAccounts.length,
              processedItems: itemIdList.length,
              successfulItems: itemIdList.length - Object.keys(errors).length
            }
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'getTransactions':
        if (!isConfigured(pluggyClientId, pluggyClientSecret)) {
          throw new Error('Credenciais do Pluggy não configuradas');
        }

        const transClient = getPluggyClient(pluggyClientId!, pluggyClientSecret!);
        
        // Buscar transações de uma conta específica
        const { accountId, from, to, startDate } = data;
        
        if (!accountId) {
          throw new Error('Account ID não fornecido');
        }

        try {
          const account = await transClient.fetchAccount(accountId);
          
          // Verificar se é conta sandbox (como no Actual)
          const sandboxAccount = account.owner === 'John Doe';
          const finalFromDate = sandboxAccount ? '2000-01-01' : (from || startDate);
          
          console.log(`Conta ${account.name} (${account.id}):`, {
            sandbox: sandboxAccount,
            owner: account.owner,
            startDate: finalFromDate
          });
          
          // Buscar todas as transações paginadas
          const allTransactions = await getAllTransactions(transClient, accountId, finalFromDate);
          
          // Marcar transações sandbox
          const transactions = sandboxAccount 
            ? allTransactions.map(trans => ({ ...trans, sandbox: true }))
            : allTransactions;

          // Calcular saldo inicial (como no Actual)
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
              referenceDate: getDate(new Date(account.updatedAt)),
            },
          ];

          console.log(`Transações encontradas: ${transactions.length}, Saldo inicial: ${startingBalance}`);

          return new Response(JSON.stringify({ 
            status: 'ok',
            data: {
              transactions,
              account,
              balances,
              startingBalance,
              summary: {
                totalTransactions: transactions.length,
                sandboxAccount,
                dateRange: {
                  from: finalFromDate,
                  to: to || 'presente'
                }
              }
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Erro ao buscar transações:', error);
          throw error;
        }

      case 'getItemById':
        if (!isConfigured(pluggyClientId, pluggyClientSecret)) {
          throw new Error('Credenciais do Pluggy não configuradas');
        }

        const itemClient = getPluggyClient(pluggyClientId!, pluggyClientSecret!);
        const { itemId } = data;
        
        if (!itemId) {
          throw new Error('Item ID não fornecido');
        }

        const item = await itemClient.fetchItem(itemId);
        
        return new Response(JSON.stringify({ 
          status: 'ok',
          data: { item }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Ação não reconhecida: ${action}`);
    }

  } catch (error) {
    console.error('Erro na função Pluggy:', error);
    
    // Estrutura de erro consistente (como no Actual)
    return new Response(JSON.stringify({ 
      status: 'ok', // O Actual retorna 'ok' mesmo com erro
      data: {
        error: error.message,
        hasError: true
      }
    }), {
      status: 200, // O Actual retorna 200 mesmo com erro
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
