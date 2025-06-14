
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Usando credenciais Pluggy:', { 
      clientId: pluggyClientId ? 'configurado' : 'não configurado',
      clientSecret: pluggyClientSecret ? 'configurado' : 'não configurado',
      credentialsSource: credentials ? 'frontend' : 'environment'
    });

    // Configurar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obter token de acesso do Pluggy
    const getAccessToken = async () => {
      console.log('Solicitando token de acesso do Pluggy...');
      console.log('Credenciais para autenticação:', {
        clientId: pluggyClientId?.substring(0, 8) + '...',
        clientSecretLength: pluggyClientSecret?.length
      });
      
      const tokenResponse = await fetch('https://api.pluggy.ai/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: pluggyClientId,
          clientSecret: pluggyClientSecret,
        }),
      });

      console.log('Status da resposta do token:', tokenResponse.status);

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Erro ao obter token:', errorText);
        throw new Error(`Erro ao obter token do Pluggy: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('Resposta completa do token:', tokenData);
      
      // Diferentes estruturas possíveis de resposta
      const accessToken = tokenData.accessToken || tokenData.access_token || tokenData.token;
      
      console.log('Token obtido:', accessToken ? 'sucesso' : 'falhou');
      console.log('Primeiros caracteres do token:', accessToken?.substring(0, 20) + '...');
      
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado na resposta da API');
      }
      
      return accessToken;
    };

    switch (action) {
      case 'getConnectors':
        // Buscar conectores disponíveis (bancos)
        const accessToken = await getAccessToken();
        
        console.log('Buscando conectores com token...');
        console.log('Token para conectores:', accessToken?.substring(0, 20) + '...');
        
        const connectorsResponse = await fetch('https://api.pluggy.ai/connectors', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Status da resposta dos conectores:', connectorsResponse.status);
        console.log('Headers da resposta:', Object.fromEntries(connectorsResponse.headers.entries()));

        if (!connectorsResponse.ok) {
          const errorText = await connectorsResponse.text();
          console.error('Erro ao buscar conectores:', errorText);
          throw new Error(`Erro ao buscar conectores: ${connectorsResponse.status} - ${errorText}`);
        }

        const connectors = await connectorsResponse.json();
        console.log(`Encontrados ${connectors.results?.length || 0} conectores`);
        
        return new Response(JSON.stringify({ 
          connectors: connectors.results,
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'createItem':
        // Criar nova conexão com instituição financeira
        const token = await getAccessToken();
        
        console.log('Criando item para conector:', data.connectorId);
        console.log('Parâmetros recebidos:', data.parameters);
        
        const itemResponse = await fetch('https://api.pluggy.ai/items', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connectorId: data.connectorId,
            parameters: data.parameters,
          }),
        });

        console.log('Status da resposta do item:', itemResponse.status);

        if (!itemResponse.ok) {
          const errorText = await itemResponse.text();
          console.error('Erro ao criar item:', errorText);
          throw new Error(`Erro ao criar conexão: ${itemResponse.status} - ${errorText}`);
        }

        const item = await itemResponse.json();
        console.log('Item criado com sucesso:', item.id);
        
        // Salvar conexão no banco de dados
        const { error: saveError } = await supabase
          .from('conexoes_bancarias')
          .insert({
            user_id: data.userId,
            pluggy_item_id: item.id,
            connector_id: data.connectorId,
            status: item.status,
            instituicao: data.connectorName,
          });

        if (saveError) {
          console.error('Erro ao salvar conexão:', saveError);
        } else {
          console.log('Conexão salva no banco de dados');
        }

        return new Response(JSON.stringify({ 
          item,
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'getItemsByItemId':
        // Buscar item específico usando Item ID
        const itemToken = await getAccessToken();
        
        console.log('Buscando item com ID:', data.itemId);
        const itemByIdResponse = await fetch(`https://api.pluggy.ai/items/${data.itemId}`, {
          headers: {
            'Authorization': `Bearer ${itemToken}`,
          },
        });

        if (!itemByIdResponse.ok) {
          const errorText = await itemByIdResponse.text();
          console.error('Erro ao buscar item:', errorText);
          throw new Error(`Erro ao buscar item: ${itemByIdResponse.status}`);
        }

        const itemData = await itemByIdResponse.json();
        console.log('Item encontrado:', itemData.id);
        
        return new Response(JSON.stringify({ 
          item: itemData,
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'getAccounts':
        // Buscar contas de um item conectado
        const accountsToken = await getAccessToken();
        
        console.log('Buscando contas para item:', data.itemId);
        const accountsResponse = await fetch(`https://api.pluggy.ai/accounts?itemId=${data.itemId}`, {
          headers: {
            'Authorization': `Bearer ${accountsToken}`,
          },
        });

        if (!accountsResponse.ok) {
          const errorText = await accountsResponse.text();
          console.error('Erro ao buscar contas:', errorText);
          throw new Error(`Erro ao buscar contas: ${accountsResponse.status}`);
        }

        const accounts = await accountsResponse.json();
        console.log(`Encontradas ${accounts.results?.length || 0} contas`);
        
        return new Response(JSON.stringify({ 
          accounts: accounts.results,
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'getTransactions':
        // Buscar transações de uma conta
        const transactionsToken = await getAccessToken();
        
        console.log('Buscando transações para conta:', data.accountId);
        const transactionsResponse = await fetch(`https://api.pluggy.ai/transactions?accountId=${data.accountId}&from=${data.from}&to=${data.to}`, {
          headers: {
            'Authorization': `Bearer ${transactionsToken}`,
          },
        });

        if (!transactionsResponse.ok) {
          const errorText = await transactionsResponse.text();
          console.error('Erro ao buscar transações:', errorText);
          throw new Error(`Erro ao buscar transações: ${transactionsResponse.status}`);
        }

        const transactions = await transactionsResponse.json();
        console.log(`Encontradas ${transactions.results?.length || 0} transações`);
        
        return new Response(JSON.stringify({ 
          transactions: transactions.results,
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error('Ação não reconhecida');
    }

  } catch (error) {
    console.error('Erro na função Pluggy:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
