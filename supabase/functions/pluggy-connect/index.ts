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
    console.log('🔧 PluggyClient criado com:', {
      clientId: clientId ? `${clientId.substring(0, 8)}...` : 'não definido',
      clientSecret: clientSecret ? 'definido' : 'não definido'
    });
  }

  private async getAccessToken(): Promise<string> {
    // Verificar se o token ainda é válido (com margem de 5 minutos)
    if (this.accessToken && Date.now() < this.tokenExpiry - 300000) {
      console.log('🔄 Usando token existente');
      return this.accessToken;
    }

    console.log('🔑 Obtendo novo token de acesso do Pluggy...');
    console.log('📡 Fazendo requisição para: https://api.pluggy.ai/auth');

    try {
      const response = await fetch('https://api.pluggy.ai/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          clientId: this.clientId,
          clientSecret: this.clientSecret,
        }),
      });

      console.log(`📊 Status da resposta de auth: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao obter token - Status:', response.status);
        console.error('❌ Erro ao obter token - Resposta:', errorText);
        
        let errorMessage = `Erro de autenticação Pluggy: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` - ${errorJson.message || errorJson.error || errorText}`;
        } catch {
          errorMessage += ` - ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('📝 Resposta completa da auth:', JSON.stringify(data, null, 2));
      
      // A API da Pluggy retorna o token no campo 'apiKey'
      this.accessToken = data.apiKey;
      
      if (!this.accessToken) {
        console.error('❌ Token de acesso não encontrado na resposta:', data);
        throw new Error('Token de acesso não encontrado na resposta da API');
      }

      // Definir expiração (padrão 2 horas se não informado)
      const expiresIn = data.expiresIn || data.expires_in || 7200;
      this.tokenExpiry = Date.now() + (expiresIn * 1000);
      
      console.log(`✅ Token obtido com sucesso (expira em ${expiresIn}s)`);
      console.log(`🔑 Token: ${this.accessToken.substring(0, 20)}...`);
      
      return this.accessToken;
    } catch (error) {
      console.error('💥 Erro crítico ao obter token:', error);
      throw error;
    }
  }

  async fetchAccounts(itemId: string) {
    const token = await this.getAccessToken();
    
    console.log(`🏦 Buscando contas para item: ${itemId}`);
    console.log(`🔑 Usando token: ${token.substring(0, 20)}...`);
    
    const url = `https://api.pluggy.ai/accounts?itemId=${itemId}`;
    console.log(`📡 URL da requisição: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': token, // Pluggy usa X-API-KEY ao invés de Authorization Bearer
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log(`📊 Status da resposta de contas: ${response.status}`);
      console.log(`🔗 Headers da requisição enviados:`, {
        'X-API-KEY': `${token.substring(0, 20)}...`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro ao buscar contas - Status: ${response.status}`);
        console.error(`❌ Erro ao buscar contas - Resposta: ${errorText}`);
        
        let errorMessage = `Erro ao buscar contas: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` - ${errorJson.message || errorJson.error || 'Erro desconhecido'}`;
          console.error('❌ Erro JSON:', errorJson);
        } catch {
          errorMessage += ` - ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`📝 Resposta completa das contas para item ${itemId}:`, JSON.stringify(data, null, 2));
      
      const results = data.results || data || [];
      console.log(`✅ ${results.length} contas encontradas para item ${itemId}:`, 
        results.map(acc => ({ id: acc.id, name: acc.name, type: acc.type })));
      
      return {
        results: results,
        total: data.total || results.length,
        hasError: false,
        errors: {},
      };
    } catch (error) {
      console.error(`💥 Erro ao buscar contas para item ${itemId}:`, error);
      throw error;
    }
  }

  async fetchAccount(accountId: string) {
    const token = await this.getAccessToken();
    
    console.log(`🏦 Buscando conta específica: ${accountId}`);
    
    const url = `https://api.pluggy.ai/accounts/${accountId}`;
    console.log(`📡 URL da requisição: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': token, // Pluggy usa X-API-KEY
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log(`📊 Status da resposta da conta: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro ao buscar conta ${accountId}:`, response.status, errorText);
        
        let errorMessage = `Erro ao buscar conta: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` - ${errorJson.message || errorJson.error || 'Erro desconhecido'}`;
        } catch {
          errorMessage += ` - ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const account = await response.json();
      console.log(`✅ Conta encontrada:`, { id: account.id, name: account.name, type: account.type });
      
      return {
        ...account,
        hasError: false,
        errors: {},
      };
    } catch (error) {
      console.error(`💥 Erro ao buscar conta ${accountId}:`, error);
      throw error;
    }
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
    
    const url = `https://api.pluggy.ai/transactions?${params}`;
    console.log(`💰 Buscando transações: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': token, // Pluggy usa X-API-KEY
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log(`📊 Status da resposta de transações: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro ao buscar transações:`, response.status, errorText);
        
        let errorMessage = `Erro ao buscar transações: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` - ${errorJson.message || errorJson.error || 'Erro desconhecido'}`;
        } catch {
          errorMessage += ` - ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ ${data.results?.length || 0} transações encontradas`);
      
      return {
        results: data.results || [],
        total: data.total || 0,
        totalPages: data.totalPages || 1,
        page: data.page || 1,
        hasError: false,
        errors: {},
      };
    } catch (error) {
      console.error(`💥 Erro ao buscar transações:`, error);
      throw error;
    }
  }

  async fetchItem(itemId: string) {
    const token = await this.getAccessToken();
    
    console.log(`📋 Buscando item: ${itemId}`);
    
    const url = `https://api.pluggy.ai/items/${itemId}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': token, // Pluggy usa X-API-KEY
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log(`📊 Status da resposta do item: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro ao buscar item:`, response.status, errorText);
        
        let errorMessage = `Erro ao buscar item: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` - ${errorJson.message || errorJson.error || 'Erro desconhecido'}`;
        } catch {
          errorMessage += ` - ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const item = await response.json();
      console.log(`✅ Item encontrado:`, item.id);
      
      return item;
    } catch (error) {
      console.error(`💥 Erro ao buscar item:`, error);
      throw error;
    }
  }
}

// Instância global do cliente (como no Actual)
let pluggyClient: PluggyClient | null = null;

function getPluggyClient(clientId: string, clientSecret: string): PluggyClient {
  if (!pluggyClient || pluggyClient['clientId'] !== clientId) {
    console.log('🆕 Criando nova instância do cliente Pluggy');
    pluggyClient = new PluggyClient(clientId, clientSecret);
  }
  return pluggyClient;
}

// Função para verificar se está configurado (como no Actual)
function isConfigured(clientId?: string, clientSecret?: string): boolean {
  const configured = !!(clientId && clientSecret);
  console.log('🔍 Verificando configuração:', {
    clientId: clientId ? 'definido' : 'não definido',
    clientSecret: clientSecret ? 'definido' : 'não definido',
    configured
  });
  return configured;
}

// Função para buscar contas por Item ID (como no Actual)
async function getAccountsByItemId(client: PluggyClient, itemId: string) {
  try {
    console.log(`🔍 Buscando contas para Item ID: ${itemId}`);
    const result = await client.fetchAccounts(itemId);
    console.log(`✅ Item ${itemId}: encontradas ${result.results.length} contas`);
    return result;
  } catch (error) {
    console.error(`❌ Erro ao buscar contas para item ${itemId}:`, error.message);
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
    
    console.log(`📄 Página ${page - 1}/${result.totalPages}: ${result.results.length} transações`);
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
    
    console.log('🚀 Processando ação:', action);
    console.log('📦 Dados recebidos:', data ? Object.keys(data) : 'nenhum');
    
    // Usar credenciais do frontend ou variáveis de ambiente como fallback
    const pluggyClientId = credentials?.clientId || Deno.env.get('PLUGGY_CLIENT_ID');
    const pluggyClientSecret = credentials?.clientSecret || Deno.env.get('PLUGGY_CLIENT_SECRET');
    
    console.log('🔑 Credenciais configuradas:', {
      clientId: pluggyClientId ? `${pluggyClientId.substring(0, 8)}...` : 'não configurado',
      clientSecret: pluggyClientSecret ? 'configurado' : 'não configurado',
      source: credentials ? 'frontend' : 'environment'
    });

    // Validação básica das credenciais
    if (!pluggyClientId || !pluggyClientSecret) {
      console.error('❌ Credenciais não fornecidas ou inválidas');
      return new Response(JSON.stringify({ 
        status: 'ok',
        data: {
          error: 'Credenciais Pluggy não configuradas. Verifique Client ID e Client Secret.',
          hasError: true
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    switch (action) {
      case 'status':
        const configured = isConfigured(pluggyClientId, pluggyClientSecret);
        return new Response(JSON.stringify({ 
          status: 'ok',
          data: { configured }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'getAccounts':
        const client = getPluggyClient(pluggyClientId, pluggyClientSecret);
        
        // Buscar contas usando itemIds (pode ser múltiplos separados por vírgula)
        const itemIds = data?.itemIds || data?.itemId;
        if (!itemIds) {
          throw new Error('Item ID(s) não fornecido(s)');
        }

        const itemIdList = itemIds.split(',').map((id: string) => id.trim()).filter(Boolean);
        console.log('📋 Processando Item IDs:', itemIdList);
        
        let allAccounts: any[] = [];
        let hasErrors = false;
        const errors: Record<string, string> = {};

        for (const itemId of itemIdList) {
          try {
            const accountsResponse = await getAccountsByItemId(client, itemId);
            if (accountsResponse.results && accountsResponse.results.length > 0) {
              allAccounts = allAccounts.concat(accountsResponse.results);
              console.log(`✅ Item ${itemId}: ${accountsResponse.results.length} contas adicionadas`);
            } else {
              console.warn(`⚠️ Item ${itemId}: nenhuma conta encontrada`);
              errors[itemId] = 'Nenhuma conta encontrada para este Item ID';
            }
          } catch (error) {
            console.error(`❌ Item ${itemId}: erro -`, error.message);
            hasErrors = true;
            errors[itemId] = error.message;
          }
        }

        console.log(`📊 Resumo final: ${allAccounts.length} contas encontradas no total`);
        if (allAccounts.length > 0) {
          console.log('🏦 Contas encontradas:', allAccounts.map(acc => ({ 
            id: acc.id, 
            name: acc.name, 
            type: acc.type,
            balance: acc.balance 
          })));
        }

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
        const transClient = getPluggyClient(pluggyClientId, pluggyClientSecret);
        
        // Buscar transações de uma conta específica
        const { accountId, from, to, startDate } = data || {};
        
        if (!accountId) {
          throw new Error('Account ID não fornecido');
        }

        try {
          const account = await transClient.fetchAccount(accountId);
          
          // Verificar se é conta sandbox (como no Actual)
          const sandboxAccount = account.owner === 'John Doe';
          const finalFromDate = sandboxAccount ? '2000-01-01' : (from || startDate);
          
          console.log(`🏦 Conta ${account.name} (${account.id}):`, {
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

          console.log(`💰 Transações encontradas: ${transactions.length}, Saldo inicial: ${startingBalance}`);

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
          console.error('💥 Erro ao buscar transações:', error);
          throw error;
        }

      case 'getItemById':
        const itemClient = getPluggyClient(pluggyClientId, pluggyClientSecret);
        const { itemId } = data || {};
        
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
    console.error('💥 Erro crítico na função Pluggy:', error);
    console.error('📋 Stack trace:', error.stack);
    
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
